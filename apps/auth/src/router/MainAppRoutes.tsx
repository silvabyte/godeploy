import {
	createBrowserRouter,
	type LoaderFunctionArgs,
	redirect,
} from "react-router-dom";
import { AppErrorOutlet } from "../components/errors/AppErrorOutlet";
import { config } from "../config";
import {
	createLoginAction,
	createSignupAction,
} from "../routes/session/actions";
import { createSessionAuthenticateLoader } from "../routes/session/loaders";
import SessionAuthenticate, {
	type SessionAuthenticateLoaderResponse,
} from "../routes/session/SessionAuthenticate";
import SessionLogin, {
	LOGIN_ACTION_PATH,
} from "../routes/session/SessionLogin";
import SessionSignup, {
	SIGNUP_ACTION_PATH,
} from "../routes/session/SessionSignup";
import SessionVerify from "../routes/session/SessionVerify";
import type { AuthService } from "../services/auth/AuthService";
import { createRedirectToApp } from "./utils/redirectUtils";

/**
 * Creates a router configuration with the provided AuthService
 */
export function createRouter(authService: AuthService) {
	// Create authentication-related functions with the auth service
	const redirectToApp = createRedirectToApp(authService);
	const loginAction = createLoginAction(authService);
	const signupAction = createSignupAction(authService);
	const sessionAuthenticateLoader =
		createSessionAuthenticateLoader(authService);

	// Common error element used across routes
	const commonErrorElement = <AppErrorOutlet />;

	const basePath =
		document.getElementsByTagName("base")?.[0]?.getAttribute("href") ??
		config.VITE_BASE_ROUTER_PATH ??
		"/";

	// Create and return the router configuration
	return createBrowserRouter([
		{
			path: basePath,
			element: <SessionLogin />,
			errorElement: commonErrorElement,
			loader: async () => {
				return await redirectToApp();
			},
		},
		{
			path: `${basePath}/verify`,
			element: <SessionVerify />,
			errorElement: commonErrorElement,
			loader: async () => {
				return await redirectToApp();
			},
		},
		{
			path: `${basePath}/authenticate`,
			element: <SessionAuthenticate />,
			errorElement: commonErrorElement,
			loader: async (lfa: LoaderFunctionArgs) => {
				return await redirectToApp<
					Promise<SessionAuthenticateLoaderResponse | Response>
				>(sessionAuthenticateLoader.bind(null, lfa));
			},
		},
		{
			path: `${basePath}/api/ui/v1/session/logout`,
			element: null,
			errorElement: commonErrorElement,
			loader: async () => {
				await authService.logout();
				return redirect(basePath);
			},
		},
		{
			path: LOGIN_ACTION_PATH,
			element: null,
			errorElement: commonErrorElement,
			action: loginAction,
		},
		{
			path: `${basePath}/signup`,
			element: <SessionSignup />,
			errorElement: commonErrorElement,
			loader: async () => {
				return await redirectToApp();
			},
		},
		{
			path: SIGNUP_ACTION_PATH,
			element: null,
			errorElement: commonErrorElement,
			action: signupAction,
		},
	]);
}
