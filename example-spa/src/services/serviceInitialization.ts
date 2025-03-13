import { AuthService, AuthConfig } from '../auth/auth';
import { config } from '../config';

/**
 * Creates and initializes an instance of AuthService
 */
export function createAuthService(): AuthService {
  const { VITE_SUPABASE_URL, VITE_SUPABASE_KEY, VITE_AUTH_BASE_URL } = config;

  const authConfig: AuthConfig = {
    supabaseUrl: VITE_SUPABASE_URL,
    supabaseKey: VITE_SUPABASE_KEY,
    authBaseUrl: VITE_AUTH_BASE_URL,
  };

  return new AuthService({ config: authConfig });
}
