/**
 * Constants related to deep linking functionality
 */

// The key used to store the redirect URL in localStorage
export const REDIRECT_URL_STORAGE_KEY = "godeployRedirectUrl";
export const JWT_STORAGE_KEY = "godeploy-auth-jwt";
export const BACKUP_JWT_STORAGE_KEY = "godeploy-auth-jwt-backup"; //for some reason supabase keeps whiping this from local storage on page refresh and its fucking annoying
export const SESSION_STORAGE_KEY = "godeploy-auth-session";

// The protocol prefix for deep links to the desktop app
// export const DEEP_LINK_PROTOCOL = 'godeploy://';

// The query parameter name for the redirect URL
export const REDIRECT_URL_PARAM = "redirect_url";

// The query parameter name for the token
const TOKEN_PARAM = "access_token";
