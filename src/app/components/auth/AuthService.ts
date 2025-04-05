import type { SupabaseClient } from '@supabase/supabase-js';
import type { Result } from '../../types/result.types';

export interface AuthUser {
  id: string;
  email: string;
  tenant_id: string;
}

export class AuthService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getUserByToken(token: string): Promise<Result<AuthUser>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token);

      if (error || !user) {
        return {
          error: error?.message || 'Invalid token',
          data: null,
        };
      }

      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData) {
        return {
          error: userError?.message || 'User not found',
          data: null,
        };
      }

      return {
        error: null,
        data: {
          id: user.id,
          email: user.email!,
          tenant_id: userData.tenant_id,
        },
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Authentication failed',
        data: null,
      };
    }
  }

  async sendMagicLink(
    email: string,
    redirectUrl: string
  ): Promise<Result<boolean>> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        return {
          error: error.message,
          data: null,
        };
      }

      return {
        error: null,
        data: true,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to send magic link',
        data: null,
      };
    }
  }
}
