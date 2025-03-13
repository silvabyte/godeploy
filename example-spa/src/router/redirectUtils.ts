import { redirect } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { config } from '../config';
import {
  DEEP_LINK_PROTOCOL,
  REDIRECT_URL_STORAGE_KEY,
  TOKEN_PARAM,
} from '../constants/deepLinkConstants';
import { AuthService } from '../auth/auth';

/**
 * Encodes a session token as a URL-safe string
 */
export function urlencodeJsonToken(jsonToken: Session) {
  return encodeURIComponent(JSON.stringify(jsonToken));
}

/**
 * Creates a function that handles redirection logic based on authentication state
 * @param authService The authentication service instance
 * @returns A function that handles redirection
 */
export function createRedirectToApp(authService: AuthService) {
  /**
   * Handles redirection logic based on authentication state
   * Supports deep linking to the desktop app via audetic:// protocol
   */
  return async function redirectToApp<T>(next: () => T | null = () => null) {
    const token = await authService.getSession();
    // Check if we have a stored redirect URL for deep linking
    const storedRedirectUrl = localStorage.getItem(REDIRECT_URL_STORAGE_KEY);

    if (token) {
      if (storedRedirectUrl && storedRedirectUrl.startsWith(DEEP_LINK_PROTOCOL)) {
        // Clear the stored redirect URL
        localStorage.removeItem(REDIRECT_URL_STORAGE_KEY);
        // Redirect to the deep link protocol with the token
        const encodedToken = urlencodeJsonToken(token);
        const redirectUrl = `${storedRedirectUrl}?${TOKEN_PARAM}=${encodedToken}`;
        window.location.href = redirectUrl;
        return null;
      }
      const url = `${config.VITE_BASE_URL}/session/?${TOKEN_PARAM}=${urlencodeJsonToken(token)}`;
      return redirect(url);
    }

    const user = await authService.getCurrentUser();
    if (user) {
      if (storedRedirectUrl && storedRedirectUrl.startsWith(DEEP_LINK_PROTOCOL)) {
        // Clear the stored redirect URL
        localStorage.removeItem(REDIRECT_URL_STORAGE_KEY);
        // Redirect to the deep link protocol
        window.location.href = storedRedirectUrl;
        return null;
      }
      return redirect(config.VITE_BASE_URL);
    }

    return next();
  };
}
