import { type ActionFunctionArgs, redirect } from "react-router-dom";
import { config } from "../../config";
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

/**
 * Creates a signup action function with the provided AuthService
 */
export function createSignupAction(authService: AuthService) {
	return async function signupAction({ request }: ActionFunctionArgs) {
		/* ============================================================== */
		/* 1. Get form data
    /* ============================================================== */
		const form = await request.formData();
		const email = form.get("email") as string;
		const password = form.get("password") as string;
		const redirectUrlValue = form.get(REDIRECT_URL_PARAM);
		const sessionManager = SessionManager.getInstance();
		const defaultDashboardUrl = `${config.VITE_DASHBOARD_BASE_URL}/session`;
		const redirectUrl = redirectUrlValue
			? redirectUrlValue.toString()
			: sessionManager.getStoredRedirectUrlOrDefault() || defaultDashboardUrl;

		/* ============================================================== */
		/* 2. Attempt sign up
    /* ============================================================== */
		debug.log("[SignupAction] Attempting sign up with password", {
			email,
			redirectUrl,
			hasRedirectParam: !!redirectUrlValue,
		});

		const { data, error } = await authService.signUp(email, password);

		if (error) {
			debug.error(error, {
				action: "signupAction",
				email,
				redirectUrl,
			});
			trackEvent("signup.failure", {
				email,
				redirectUrl,
				error: error.message,
			});
			return { error: error };
		}

		/* ============================================================== */
		/* 3. Redirect to dashboard on success
    /* ============================================================== */
		debug.log("[SignupAction] Sign up successful", {
			email,
			redirectUrl,
			session: !!data?.session,
		});
		trackEvent("signup.success", {
			email,
			redirectUrl,
		});

		// Redirect to dashboard with session
		return redirect(redirectUrl);
	};
}
