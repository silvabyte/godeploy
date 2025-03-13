import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth';
import { DEEP_LINK_PROTOCOL, REDIRECT_URL_PARAM } from '../constants/deepLinkConstants';
import { SupabaseClient } from '@supabase/supabase-js';
// Mock the withTimeout function
vi.mock('./async-utils', () => ({
  withTimeout: vi.fn(({ promise }) => promise),
}));

// Mock the Supabase client
const mockSupabaseClient = {
  auth: {
    signInWithOtp: vi.fn(),
    verifyOtp: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
};

describe('AuthService - Deep Linking', () => {
  let authService: AuthService;
  const authBaseUrl = 'https://auth.example.com';

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create a new instance of AuthService with mock client for each test
    authService = new AuthService({
      client: mockSupabaseClient as unknown as SupabaseClient,
      config: {
        supabaseUrl: 'https://example.com',
        supabaseKey: 'test-key',
        authBaseUrl,
      },
    });
  });

  describe('signInWithEmail', () => {
    it('should append redirect URL to emailRedirectTo when it starts with the deep link protocol', async () => {
      // Arrange
      const email = 'test@example.com';
      const redirectUrl = `${DEEP_LINK_PROTOCOL}callback`;
      mockSupabaseClient.auth.signInWithOtp.mockResolvedValue({
        data: { someData: true },
        error: null,
      });

      // Act
      await authService.signInWithEmail(email, redirectUrl);

      // Assert
      expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          emailRedirectTo: `${authBaseUrl}?${REDIRECT_URL_PARAM}=${encodeURIComponent(redirectUrl)}`,
          shouldCreateUser: true,
        },
      });
    });

    it('should not append redirect URL to emailRedirectTo when it does not start with the deep link protocol', async () => {
      // Arrange
      const email = 'test@example.com';
      const redirectUrl = 'https://example.com';
      mockSupabaseClient.auth.signInWithOtp.mockResolvedValue({
        data: { someData: true },
        error: null,
      });

      // Act
      await authService.signInWithEmail(email, redirectUrl);

      // Assert
      expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          emailRedirectTo: authBaseUrl,
          shouldCreateUser: true,
        },
      });
    });

    it('should not append redirect URL to emailRedirectTo when it is not provided', async () => {
      // Arrange
      const email = 'test@example.com';
      mockSupabaseClient.auth.signInWithOtp.mockResolvedValue({
        data: { someData: true },
        error: null,
      });

      // Act
      await authService.signInWithEmail(email);

      // Assert
      expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          emailRedirectTo: authBaseUrl,
          shouldCreateUser: true,
        },
      });
    });

    it('should handle URLs with existing query parameters', async () => {
      // Arrange
      const email = 'test@example.com';
      const redirectUrl = `${DEEP_LINK_PROTOCOL}callback`;
      const authBaseUrlWithQuery = `${authBaseUrl}?existing=param`;

      // Create a new instance with auth base URL that has a query parameter
      authService = new AuthService({
        client: mockSupabaseClient as unknown as SupabaseClient,
        config: {
          supabaseUrl: 'https://example.com',
          supabaseKey: 'test-key',
          authBaseUrl: authBaseUrlWithQuery,
        },
      });

      mockSupabaseClient.auth.signInWithOtp.mockResolvedValue({
        data: { someData: true },
        error: null,
      });

      // Act
      await authService.signInWithEmail(email, redirectUrl);

      // Assert
      expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
        email,
        options: {
          emailRedirectTo: `${authBaseUrlWithQuery}&${REDIRECT_URL_PARAM}=${encodeURIComponent(redirectUrl)}`,
          shouldCreateUser: true,
        },
      });
    });
  });
});
