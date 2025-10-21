import { type ActionFunctionArgs, redirect } from "react-router-dom";
import { REDIRECT_URL_PARAM } from "../../constants/auth.constants";
import { trackEvent } from "../../router/telemetry/telemetry";
import type { AuthService } from "../../services/auth/AuthService";
import { SessionManager } from "../../services/auth/SessionManager";
import { debug } from "../../utils/debug";

/**
 * Creates a login action function with the provided AuthService
 */
export function createLoginAction(authService: AuthService) {
	// let this breathe in spacing

	return async function loginAction({ request }: ActionFunctionArgs) {
		/* ============================================================== */
		/* 1. Get form data
    /* ============================================================== */
		const form = await request.formData();
		const email = form.get("email") as string;
		const password = form.get("password") as string;
		const redirectUrlValue = form.get(REDIRECT_URL_PARAM);
		const sessionManager = SessionManager.getInstance();
		const redirectUrl = redirectUrlValue
			? redirectUrlValue.toString()
			: sessionManager.getStoredRedirectUrlOrDefault();

		/* ============================================================== */
		/* 2. Attempt sign in
    /* ============================================================== */
		debug.log("[LoginAction] Attempting sign in with password", {
			email,
			redirectUrl,
			hasRedirectParam: !!redirectUrlValue,
		});

		const { error } = await authService.signInWithPassword(email, password);

		if (error) {
			debug.error(error, {
				action: "loginAction",
				email,
				redirectUrl,
			});
			trackEvent("login.failure", {
				email,
				redirectUrl,
				error: error.message,
			});
			return { error: error };
		}

		/* ============================================================== */
		/* 3. Redirect to dashboard on success
    /* ============================================================== */
		debug.log("[LoginAction] Sign in successful", {
			email,
			redirectUrl,
		});
		trackEvent("login.success", {
			email,
			redirectUrl,
		});

		// With password auth, we go directly to the redirect URL instead of verify page
		return redirect(redirectUrl || "/");
	};
}
