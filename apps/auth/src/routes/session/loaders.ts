import { type LoaderFunctionArgs, redirect } from "react-router-dom";
import type { AuthService } from "../../services/auth/AuthService";
import { SessionManager } from "../../services/auth/SessionManager";
import { debug } from "../../utils/debug";
import { addQueryParams, getHashParams } from "../../utils/url";
import type { SessionAuthenticateLoaderResponse } from "./SessionAuthenticate";

/**
 * Creates a session authenticate loader function with the provided AuthService
 */
export function createSessionAuthenticateLoader(authService: AuthService) {
	return async function sessionAuthenticateLoader({
		request,
	}: LoaderFunctionArgs): Promise<
		SessionAuthenticateLoaderResponse | Response
	> {
		const sessionManager = SessionManager.getInstance();
		const context = {
			url: request.url,
			hash: typeof window !== "undefined" ? window.location.hash : "",
		};

		debug.log("[SessionAuthenticate] Starting authentication flow", context);

		const hashParams = getHashParams();
		const access_token = hashParams.get("access_token");
		const expires_at = hashParams.get("expires_at");
		const expires_in = hashParams.get("expires_in");
		const refresh_token = hashParams.get("refresh_token");
		const token_type = hashParams.get("token_type");

		if (!access_token) {
			debug.error("[SessionAuthenticate] No access token found in hash params");
			return { error: "No access token found" };
		}

		const user = await authService.getCurrentUser(access_token);
		if (!user) {
			sessionManager.clearSession();
			debug.error("[SessionAuthenticate] No user found with token");
			return { error: "No user found in session" };
		}

		// Store token and retrieve session
		sessionManager.setSession({
			access_token,
			refresh_token: refresh_token as string,
			expires_at: parseInt(expires_at as string),
			expires_in: parseInt(expires_in as string),
			token_type: token_type as string,
			user,
		});

		debug.log("[SessionAuthenticate] Token persisted");

		const redirectUrl = sessionManager.getRedirectUrl(request.url);
		sessionManager.storeRedirectUrl(redirectUrl);

		const queryParams = {
			...Object.fromEntries(hashParams.entries()),
			...Object.fromEntries(new URL(request.url).searchParams.entries()),
		};

		const finalUrl = addQueryParams(redirectUrl, queryParams);

		sessionManager.clearStoredRedirectUrl();

		const isInternalRedirect = sessionManager.isInternalUrl(finalUrl);

		debug.log("[SessionAuthenticate] Redirect prepared", {
			finalUrl,
			isInternalRedirect,
		});

		if (!isInternalRedirect) {
			window.location.href = finalUrl;
			return { error: null };
		}

		return redirect(finalUrl);
	};
}
