import type { Session } from "@supabase/supabase-js";
import { redirect } from "react-router-dom";
import { config } from "../../config";
import { REDIRECT_URL_STORAGE_KEY } from "../../constants/auth.constants";
import type { AuthService } from "../../services/auth/AuthService";

import { debug } from "../../utils/debug";

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
	 * All auth flows should go through the auth app's /authenticate route
	 */
	return async function redirectToApp<T>(next: () => T | null = () => null) {
		//this gets set on the initial auth callback flow
		const session = await authService.refreshOnLoad();
		// Check if we have a stored redirect URL
		const storedRedirectUrl = localStorage.getItem(REDIRECT_URL_STORAGE_KEY);
		const defaultRedirectUrl = config.VITE_DASHBOARD_BASE_URL + "/session";

		if (!session) {
			debug.log(
				"[RedirectUtils] No session found, clearing tokens calling next()",
			);
			// If session is invalid, clear tokens to force re-auth on next try
			authService.clearSession();
			return next();
		}

		// Do not clear token here — preserving state for automatic re-auth redirect

		debug.log(
			`[RedirectUtils] Current state: hasToken: ${!!session} storedRedirectUrl: ${storedRedirectUrl} defaultRedirectUrl: ${defaultRedirectUrl}`,
		);

		// Clear any stored redirect URL since we're about to use it
		if (storedRedirectUrl) {
			debug.log(
				"[RedirectUtils] Removing stored redirect URL: " +
					localStorage.getItem(REDIRECT_URL_STORAGE_KEY),
			);
			localStorage.removeItem(REDIRECT_URL_STORAGE_KEY);
		}

		let targetUrl = storedRedirectUrl || defaultRedirectUrl;
		if (new URL(targetUrl).hostname !== new URL(defaultRedirectUrl).hostname) {
			debug.log(
				"[RedirectUtils] Redirecting to default URL: " + defaultRedirectUrl,
			);
			targetUrl = defaultRedirectUrl;
		}
		debug.log(
			`[RedirectUtils] Redirecting with token: ${session?.access_token} targetUrl: ${targetUrl} storedRedirectUrl: ${storedRedirectUrl} defaultRedirectUrl: ${defaultRedirectUrl}`,
		);

		// const finalRedirectUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}${TOKEN_PARAM}=${token}`;
		let finalRedirectUrl = targetUrl;
		const sessionWithoutUser = Object.fromEntries(
			Object.entries(session).filter(([key]) => key !== "user"),
		);
		if (Object.keys(sessionWithoutUser).length > 0) {
			finalRedirectUrl =
				targetUrl +
				`${targetUrl.includes("?") ? "&" : "?"}${new URLSearchParams(sessionWithoutUser).toString()}`;
		}

		// For deep links or external URLs, use window.location
		if (targetUrl !== defaultRedirectUrl) {
			debug.log(
				"[RedirectUtils] Using window.location for external redirect: " +
					finalRedirectUrl,
			);
			window.location.href = finalRedirectUrl;
			return null;
		}

		// For internal redirects, use react-router redirect
		debug.log(
			"[RedirectUtils] Using react-router for internal redirect: " +
				finalRedirectUrl,
		);
		return redirect(finalRedirectUrl);
	};
}
