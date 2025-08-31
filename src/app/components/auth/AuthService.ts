import type { SupabaseClient } from '@supabase/supabase-js'
import type { Result } from '../../types/result.types'

export interface AuthUser {
  id: string
  email: string
  tenant_id: string
}

export class AuthService {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async getUserByToken(token: string): Promise<Result<AuthUser>> {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser(token)

      if (error || !user) {
        return {
          error: error?.message || 'Invalid token',
          data: null,
        }
      }

      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        return {
          error: userError?.message || 'User not found',
          data: null,
        }
      }

      return {
        error: null,
        data: {
          id: user.id,
          email: user.email!,
          tenant_id: userData.tenant_id,
        },
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Authentication failed',
        data: null,
      }
    }
  }

  async sendMagicLink(email: string, redirectUrl: string): Promise<Result<boolean>> {
    try {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        return {
          error: error.message,
          data: null,
        }
      }

      return {
        error: null,
        data: true,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to send magic link',
        data: null,
      }
    }
  }

  async signUp(email: string, password: string): Promise<Result<{ token: string; user: AuthUser }>> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return {
          error: error.message,
          data: null,
        }
      }

      if (!data.user || !data.session) {
        return {
          error: 'Failed to create account',
          data: null,
        }
      }

      // Get tenant info for the new user
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('tenant_id')
        .eq('id', data.user.id)
        .single()

      if (userError || !userData) {
        return {
          error: 'Failed to get user information',
          data: null,
        }
      }

      return {
        error: null,
        data: {
          token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email!,
            tenant_id: userData.tenant_id,
          },
        },
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Sign up failed',
        data: null,
      }
    }
  }

  async signIn(email: string, password: string): Promise<Result<{ token: string; user: AuthUser }>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return {
          error: error.message,
          data: null,
        }
      }

      if (!data.user || !data.session) {
        return {
          error: 'Invalid credentials',
          data: null,
        }
      }

      // Get tenant info for the user
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('tenant_id')
        .eq('id', data.user.id)
        .single()

      if (userError || !userData) {
        return {
          error: 'User not found',
          data: null,
        }
      }

      return {
        error: null,
        data: {
          token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email!,
            tenant_id: userData.tenant_id,
          },
        },
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Sign in failed',
        data: null,
      }
    }
  }

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<Result<boolean>> {
    try {
      // First verify the current password by attempting to sign in
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser(token)

      if (userError || !user || !user.email) {
        return {
          error: 'Invalid session',
          data: null,
        }
      }

      // Verify current password
      const { error: signInError } = await this.supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        return {
          error: 'Current password is incorrect',
          data: null,
        }
      }

      // Update password
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return {
          error: error.message,
          data: null,
        }
      }

      return {
        error: null,
        data: true,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to change password',
        data: null,
      }
    }
  }

  async requestPasswordReset(email: string, redirectUrl?: string): Promise<Result<boolean>> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl || `${process.env.APP_URL || 'https://api.godeploy.app'}/reset-password`,
      })

      if (error) {
        return {
          error: error.message,
          data: null,
        }
      }

      return {
        error: null,
        data: true,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to send reset email',
        data: null,
      }
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<Result<boolean>> {
    try {
      // Exchange the token for a session
      const { data, error: exchangeError } = await this.supabase.auth.exchangeCodeForSession(token)

      if (exchangeError || !data.session) {
        return {
          error: 'Invalid or expired reset token',
          data: null,
        }
      }

      // Update the password
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return {
          error: error.message,
          data: null,
        }
      }

      return {
        error: null,
        data: true,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to reset password',
        data: null,
      }
    }
  }

  async signOut(): Promise<Result<boolean>> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return {
          error: error.message,
          data: null,
        }
      }

      return {
        error: null,
        data: true,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Failed to sign out',
        data: null,
      }
    }
  }
}
