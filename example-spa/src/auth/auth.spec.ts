import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth';
import { SupabaseClient } from '@supabase/supabase-js';
import * as asyncUtils from './async-utils';

// Spy on withTimeout
vi.spyOn(asyncUtils, 'withTimeout').mockImplementation(({ promise }) => promise);

describe('AuthService', () => {
  let authService: AuthService;
  let mockSupabaseClient: {
    auth: {
      getUser: ReturnType<typeof vi.fn>;
      getSession: ReturnType<typeof vi.fn>;
      signInWithOtp: ReturnType<typeof vi.fn>;
      verifyOtp: ReturnType<typeof vi.fn>;
      signOut: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: vi.fn(),
        getSession: vi.fn(),
        signInWithOtp: vi.fn(),
        verifyOtp: vi.fn(),
        signOut: vi.fn(),
      },
    };

    // Create a new instance of AuthService with mock client for each test
    authService = new AuthService({
      client: mockSupabaseClient as unknown as SupabaseClient,
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when successful', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(asyncUtils.withTimeout).toHaveBeenCalledWith(
        expect.objectContaining({
          promise: expect.any(Promise),
          timeoutDuration: 5000,
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when there is an error', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('User not found'),
      });

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return session when successful', async () => {
      // Arrange
      const mockSession = {
        access_token: 'token-123',
        user: { id: 'user-123', email: 'test@example.com' },
      };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Act
      const result = await authService.getSession();

      // Assert
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSession);
    });

    it('should return null when there is an error', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session not found'),
      });

      // Act
      const result = await authService.getSession();

      // Assert
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe('signInWithEmail', () => {
    it('should return error when email is null', async () => {
      // Act
      const result = await authService.signInWithEmail(null);

      // Assert
      expect(mockSupabaseClient.auth.signInWithOtp).not.toHaveBeenCalled();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('email cannot be empty');
    });

    it('should call signInWithOtp with correct parameters', async () => {
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
          emailRedirectTo: expect.any(String),
          shouldCreateUser: true,
        },
      });
    });
  });

  describe('verifyOTP', () => {
    it('should call verifyOtp with correct parameters', async () => {
      // Arrange
      const token_hash = 'token-hash-123';
      const type = 'email' as const;
      mockSupabaseClient.auth.verifyOtp.mockResolvedValue({
        data: { someData: true },
        error: null,
      });

      // Act
      await authService.verifyOTP(token_hash, type);

      // Assert
      expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
        type,
        token_hash,
      });
    });
  });

  describe('logout', () => {
    it('should call signOut', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const result = await authService.logout();

      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('should return error when signOut fails', async () => {
      // Arrange
      const mockError = new Error('Sign out failed');
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: mockError,
      });

      // Act
      const result = await authService.logout();

      // Assert
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockError);
    });
  });
});
