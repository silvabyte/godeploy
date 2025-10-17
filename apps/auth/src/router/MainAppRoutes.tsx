import {
	LoaderFunctionArgs,
	createBrowserRouter,
	redirect,
} from "react-router-dom";
import SessionLogin, {
	LOGIN_ACTION_PATH,
} from "../routes/session/SessionLogin";
import SessionVerify from "../routes/session/SessionVerify";
import SessionAuthenticate, {
	SessionAuthenticateLoaderResponse,
} from "../routes/session/SessionAuthenticate";
import { createRedirectToApp } from "./utils/redirectUtils";
import { AuthService } from "../services/auth/AuthService";
import { config } from "../config";
import { AppErrorOutlet } from "../components/errors/AppErrorOutlet";
import { createLoginAction } from "../routes/session/actions";
import { createSessionAuthenticateLoader } from "../routes/session/loaders";

/**
 * Creates a router configuration with the provided AuthService
 */
export function createRouter(authService: AuthService) {
	// Create authentication-related functions with the auth service
	const redirectToApp = createRedirectToApp(authService);
	const loginAction = createLoginAction(authService);
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
	]);
}
