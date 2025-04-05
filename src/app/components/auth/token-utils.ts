import type { Result } from '../../types/result.types';

export interface TokenParseResult {
  redirectUrl: URL;
  hasToken: boolean;
}

/**
 * Extracts access token from URL hash and adds it to redirect URL
 * @param rawUrl - The raw URL containing potential hash parameters
 * @param redirectTo - The base redirect URL to add parameters to
 */
export function parseUrlHash(
  rawUrl: string,
  redirectTo: string
): Result<TokenParseResult> {
  try {
    const hashMatch = rawUrl.match(/#(.+)$/);
    if (!hashMatch || !hashMatch[1]) {
      return {
        data: {
          redirectUrl: new URL(redirectTo),
          hasToken: false,
        },
        error: null,
      };
    }

    const hashParams = new URLSearchParams(hashMatch[1]);
    const accessToken = hashParams.get('access_token');
    const redirectUrl = new URL(redirectTo);

    if (accessToken) {
      // Convert all hash parameters to query parameters
      for (const [key, value] of hashParams.entries()) {
        redirectUrl.searchParams.set(key, value);
      }
      return {
        data: {
          redirectUrl,
          hasToken: true,
        },
        error: null,
      };
    }

    return {
      data: {
        redirectUrl,
        hasToken: false,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : 'Failed to parse URL hash',
    };
  }
}

/**
 * Adds a token to the redirect URL as a query parameter
 * @param redirectTo - The base redirect URL
 * @param token - The token to add
 */
export function addTokenToUrl(redirectTo: string, token: string): Result<URL> {
  try {
    const redirectUrl = new URL(redirectTo);
    redirectUrl.searchParams.set('access_token', token);
    return {
      data: redirectUrl,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : 'Failed to add token to URL',
    };
  }
}

/**
 * Extracts bearer token from authorization header
 * @param authHeader - The authorization header value
 */
export function extractBearerToken(authHeader?: string): Result<string> {
  if (!authHeader) {
    return {
      data: null,
      error: 'Missing authorization header',
    };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return {
      data: null,
      error: 'Invalid authorization header format',
    };
  }

  return {
    data: token,
    error: null,
  };
}
