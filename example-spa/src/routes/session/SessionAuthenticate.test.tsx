import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSessionAuthenticateLoader } from './SessionAuthenticate';
import { createMockAuthService } from '../../auth/testUtils';
import {
  DEEP_LINK_PROTOCOL,
  REDIRECT_URL_PARAM,
  REDIRECT_URL_STORAGE_KEY,
} from '../../constants/deepLinkConstants';
import { LoaderFunctionArgs } from 'react-router-dom';
import { AuthService } from '../../auth/auth';

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

describe('SessionAuthenticate', () => {
  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('createSessionAuthenticateLoader', () => {
    it('should store redirect URL in localStorage if it starts with the deep link protocol', async () => {
      // Arrange
      const authService = createMockAuthService();
      authService.verifyOTP.mockResolvedValue({ data: {}, error: null });

      const redirectUrl = `${DEEP_LINK_PROTOCOL}callback`;
      const token_hash = 'test-token-hash';
      const type = 'email';

      const url = new URL(
        `https://example.com/authenticate?token_hash=${token_hash}&type=${type}&${REDIRECT_URL_PARAM}=${encodeURIComponent(redirectUrl)}`,
      );

      const request = {
        url: url.toString(),
      } as unknown as Request;

      const sessionAuthenticateLoader = createSessionAuthenticateLoader(
        authService as unknown as AuthService,
      );

      // Act
      await sessionAuthenticateLoader({ request } as LoaderFunctionArgs);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith(REDIRECT_URL_STORAGE_KEY, redirectUrl);
    });

    it('should not store redirect URL if it does not start with the deep link protocol', async () => {
      // Arrange
      const authService = createMockAuthService();
      authService.verifyOTP.mockResolvedValue({ data: {}, error: null });

      const redirectUrl = 'https://example.com';
      const token_hash = 'test-token-hash';
      const type = 'email';

      const url = new URL(
        `https://example.com/authenticate?token_hash=${token_hash}&type=${type}&${REDIRECT_URL_PARAM}=${encodeURIComponent(redirectUrl)}`,
      );

      const request = {
        url: url.toString(),
      } as unknown as Request;

      const sessionAuthenticateLoader = createSessionAuthenticateLoader(
        authService as unknown as AuthService,
      );

      // Act
      await sessionAuthenticateLoader({ request } as LoaderFunctionArgs);

      // Assert
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('should return error when token_hash or type is missing', async () => {
      // Arrange
      const authService = createMockAuthService();

      const url = new URL('https://example.com/authenticate');

      const request = {
        url: url.toString(),
      } as unknown as Request;

      const sessionAuthenticateLoader = createSessionAuthenticateLoader(
        authService as unknown as AuthService,
      );

      // Act
      const result = await sessionAuthenticateLoader({ request } as LoaderFunctionArgs);

      // Assert
      expect(result).toEqual({ error: 'Missing token or type' });
      expect(authService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should call verifyOTP with token_hash and type', async () => {
      // Arrange
      const authService = createMockAuthService();
      authService.verifyOTP.mockResolvedValue({ data: {}, error: null });

      const token_hash = 'test-token-hash';
      const type = 'email';

      const url = new URL(`https://example.com/authenticate?token_hash=${token_hash}&type=${type}`);

      const request = {
        url: url.toString(),
      } as unknown as Request;

      const sessionAuthenticateLoader = createSessionAuthenticateLoader(
        authService as unknown as AuthService,
      );

      // Act
      await sessionAuthenticateLoader({ request } as LoaderFunctionArgs);

      // Assert
      expect(authService.verifyOTP).toHaveBeenCalledWith(token_hash, type);
    });

    it('should return error when verifyOTP fails', async () => {
      // Arrange
      const authService = createMockAuthService();
      const error = { message: 'Verification failed' };
      authService.verifyOTP.mockResolvedValue({ data: null, error });

      const token_hash = 'test-token-hash';
      const type = 'email';

      const url = new URL(`https://example.com/authenticate?token_hash=${token_hash}&type=${type}`);

      const request = {
        url: url.toString(),
      } as unknown as Request;

      const sessionAuthenticateLoader = createSessionAuthenticateLoader(
        authService as unknown as AuthService,
      );

      // Act
      const result = await sessionAuthenticateLoader({ request } as LoaderFunctionArgs);

      // Assert
      expect(result).toEqual({ error: error.message });
    });
  });
});
