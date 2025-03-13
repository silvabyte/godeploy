import {
  AuthError,
  EmailOtpType,
  UserResponse,
  Session,
  AuthOtpResponse,
  SupabaseClient,
} from '@supabase/supabase-js';
import { withTimeout } from './async-utils';
import { ApiError, ErrorJson } from '@matsilva/xcomponents';
import { config } from '../config';
import { createClient } from '@supabase/supabase-js';
import { DEEP_LINK_PROTOCOL, REDIRECT_URL_PARAM } from '../constants/deepLinkConstants';

export interface AuthConfig {
  supabaseUrl: string;
  supabaseKey: string;
  authBaseUrl: string;
  timeoutDuration?: number;
}

/**
 * Service for handling authentication operations
 */
export class AuthService {
  private client: SupabaseClient;
  private authBaseUrl: string;
  private timeoutDuration: number;
  private timeoutInSeconds: number;

  constructor(options: { client?: SupabaseClient; config?: AuthConfig }) {
    if (options.client) {
      this.client = options.client;
    } else if (options.config) {
      const { supabaseUrl, supabaseKey } = options.config;
      this.client = createClient(supabaseUrl, supabaseKey);
    } else {
      // Default fallback using environment variables
      const { VITE_SUPABASE_URL, VITE_SUPABASE_KEY } = config;
      this.client = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_KEY);
    }

    this.authBaseUrl = options.config?.authBaseUrl || config.VITE_AUTH_BASE_URL;
    this.timeoutDuration = options.config?.timeoutDuration || 5000;
    this.timeoutInSeconds = this.timeoutDuration / 1000;
  }

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await withTimeout<UserResponse>({
      promise: this.client.auth.getUser(),
      timeoutDuration: this.timeoutDuration,
      timeoutReason: `client.auth.getUser timed out after ${this.timeoutInSeconds}s`,
    });

    if (error) {
      // console.error('Error fetching user:', error);
      return null;
    }

    return user;
  }

  async getSession() {
    const {
      data: { session },
      error,
    } = await withTimeout<
      | {
          data: {
            session: Session;
          };
          error: null;
        }
      | {
          data: {
            session: null;
          };
          error: AuthError;
        }
      | {
          data: {
            session: null;
          };
          error: null;
        }
    >({
      promise: this.client.auth.getSession(),
      timeoutDuration: this.timeoutDuration,
      timeoutReason: `client.auth.getSession timed out after ${this.timeoutInSeconds}s`,
    });

    if (error) {
      //TODO test what type of error is returned from here
      return null;
    }
    return session;
  }

  async signInWithEmail(email: string | null, redirectUrl?: string) {
    if (!email) {
      return { data: null, error: new Error(`email cannot be empty`) };
    }

    // Build the redirect URL with the optional redirectUrl parameter
    let emailRedirectTo = this.authBaseUrl;
    if (redirectUrl && redirectUrl.startsWith(DEEP_LINK_PROTOCOL)) {
      // Append the redirect_url as a query parameter to the authentication URL
      const separator = emailRedirectTo.includes('?') ? '&' : '?';
      emailRedirectTo = `${emailRedirectTo}${separator}${REDIRECT_URL_PARAM}=${encodeURIComponent(redirectUrl)}`;
    }

    const { data, error } = await withTimeout<AuthOtpResponse>({
      promise: this.client.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo,
          shouldCreateUser: true,
        },
      }),
      timeoutDuration: this.timeoutDuration,
      timeoutReason: `client.auth.signInWithOtp timed out after ${this.timeoutInSeconds}s`,
    });
    return { data, error: error ? new ApiError(error as ErrorJson) : null };
  }

  async verifyOTP(token_hash: string, type: EmailOtpType) {
    const { data, error } = await withTimeout({
      promise: this.client.auth.verifyOtp({
        type,
        token_hash,
      }),
      timeoutDuration: this.timeoutDuration,
      timeoutReason: `client.auth.verifyOtp timed out after ${this.timeoutInSeconds}s`,
    });
    return { data, error: error ? new ApiError(error as ErrorJson) : null };
  }

  async logout() {
    const { error } = await withTimeout({
      promise: this.client.auth.signOut(),
      timeoutDuration: this.timeoutDuration,
      timeoutReason: `client.auth.signOut timed out after ${this.timeoutInSeconds}s`,
    });
    return error;
  }
}
