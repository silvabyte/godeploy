import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRedirectToApp, urlencodeJsonToken } from './redirectUtils';
import { createMockAuthService } from '../auth/testUtils';
import { redirect } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import {
  DEEP_LINK_PROTOCOL,
  REDIRECT_URL_STORAGE_KEY,
  TOKEN_PARAM,
} from '../constants/deepLinkConstants';
import { config } from '../config';
import { AuthService } from '../auth/auth';
// Mock the redirect function from react-router-dom
vi.mock('react-router-dom', () => {
  const mockRedirect = vi.fn().mockImplementation((url) => ({ type: 'redirect', url }));
  return {
    redirect: mockRedirect,
  };
});

// Mock the config object
vi.mock('../config', () => ({
  config: {
    VITE_BASE_URL: 'http://localhost:5173',
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Mock window.location
const originalLocation = window.location;
const locationMock = {
  href: '',
};

describe('redirectUtils', () => {
  let authService: ReturnType<typeof createMockAuthService>;

  beforeEach(() => {
    // Setup mocks
    authService = createMockAuthService();

    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();

    // Setup location mock
    Object.defineProperty(window, 'location', {
      value: locationMock,
      writable: true,
    });

    // Reset mocks
    vi.clearAllMocks();

    // Ensure redirect mock is properly reset
    (redirect as unknown as { mockClear: () => void }).mockClear();
  });

  afterEach(() => {
    // Restore original window.location
    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  describe('urlencodeJsonToken', () => {
    it('should encode a session token as a URL-safe string', () => {
      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-123' },
      } as Session;

      const result = urlencodeJsonToken(mockSession);

      expect(result).toBe(encodeURIComponent(JSON.stringify(mockSession)));
    });
  });

  describe('createRedirectToApp', () => {
    it('should redirect to app with token when session exists', async () => {
      // Arrange
      const mockSession = { access_token: 'test-token' } as Session;
      vi.spyOn(authService, 'getSession').mockResolvedValue(mockSession);
      const redirectToApp = createRedirectToApp(authService as unknown as AuthService);

      // Act
      const result = await redirectToApp();

      // Assert
      expect(authService.getSession).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith(
        `${config.VITE_BASE_URL}/session/?${TOKEN_PARAM}=${urlencodeJsonToken(mockSession)}`,
      );
      expect(result).toEqual({
        type: 'redirect',
        url: `${config.VITE_BASE_URL}/session/?${TOKEN_PARAM}=${urlencodeJsonToken(mockSession)}`,
      });
    });

    it('should redirect to deep link with token when session exists and redirect URL is stored', async () => {
      // Arrange
      const mockSession = { access_token: 'test-token' } as Session;
      const deepLinkUrl = `${DEEP_LINK_PROTOCOL}callback`;
      vi.spyOn(authService, 'getSession').mockResolvedValue(mockSession);
      localStorageMock.getItem.mockReturnValue(deepLinkUrl);
      const redirectToApp = createRedirectToApp(authService as unknown as AuthService);

      // Act
      const result = await redirectToApp();

      // Assert
      expect(authService.getSession).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(REDIRECT_URL_STORAGE_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(REDIRECT_URL_STORAGE_KEY);
      expect(locationMock.href).toBe(
        `${deepLinkUrl}?${TOKEN_PARAM}=${urlencodeJsonToken(mockSession)}`,
      );
      expect(result).toBeNull();
    });

    it('should redirect to base URL when user exists but no session', async () => {
      // Arrange
      vi.spyOn(authService, 'getSession').mockResolvedValue(null);
      vi.spyOn(authService, 'getCurrentUser').mockResolvedValue({ id: 'user-123' } as User);

      // Mock localStorage to return null for the redirect URL
      localStorageMock.getItem.mockReturnValue(null);

      const redirectToApp = createRedirectToApp(authService as unknown as AuthService);

      // Act
      const result = await redirectToApp();

      // Assert
      expect(authService.getSession).toHaveBeenCalledTimes(1);
      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(redirect).toHaveBeenCalledWith(config.VITE_BASE_URL);
      expect(result).toEqual({
        type: 'redirect',
        url: config.VITE_BASE_URL,
      });
    });

    it('should redirect to deep link when user exists but no session and redirect URL is stored', async () => {
      // Arrange
      const deepLinkUrl = `${DEEP_LINK_PROTOCOL}callback`;
      vi.spyOn(authService, 'getSession').mockResolvedValue(null);
      vi.spyOn(authService, 'getCurrentUser').mockResolvedValue({ id: 'user-123' } as User);
      localStorageMock.getItem.mockReturnValue(deepLinkUrl);
      const redirectToApp = createRedirectToApp(authService as unknown as AuthService);

      // Act
      const result = await redirectToApp();

      // Assert
      expect(authService.getSession).toHaveBeenCalledTimes(1);
      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(REDIRECT_URL_STORAGE_KEY);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(REDIRECT_URL_STORAGE_KEY);
      expect(locationMock.href).toBe(deepLinkUrl);
      expect(result).toBeNull();
    });

    it('should call next function when no session or user exists', async () => {
      // Arrange
      vi.spyOn(authService, 'getSession').mockResolvedValue(null);
      vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(null);
      const nextFn = vi.fn().mockReturnValue({ type: 'next' });
      const redirectToApp = createRedirectToApp(authService as unknown as AuthService);

      // Act
      const result = await redirectToApp(nextFn);

      // Assert
      expect(authService.getSession).toHaveBeenCalledTimes(1);
      expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(nextFn).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ type: 'next' });
    });
  });
});
