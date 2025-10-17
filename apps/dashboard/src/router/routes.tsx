import { createBrowserRouter } from "react-router-dom";
import { AppErrorOutlet } from "../components/errors/AppErrorOutlet";
import type { Services } from "../services/serviceInitialization";
import { debug } from "../utils/debug";
import { createRoutes } from "./createRoutes";
import { redirectToApp, redirectToAuth } from "./redirect";

/**
 * Creates a router configuration with the provided services
 */
export function createRouter(services: Services) {
	return createBrowserRouter([
		createRoutes(services),
		{
			path: "/session",
			element: null,
			errorElement: <AppErrorOutlet />,
			loader: async () => {
				const search = new URLSearchParams(document.location.search);
				const access_token = search.get("access_token");
				const refresh_token = search.get("refresh_token");

				try {
					if (!access_token) {
						debug.log("[Router] No access token found in URL");
						return redirectToAuth();
					}

					// Refresh session with new tokens if available
					const refreshedSession = await services.authService.refreshOnLoad(
						refresh_token ?? undefined,
					);

					if (!refreshedSession) {
						return redirectToAuth();
					}

					// Verify the token by getting the user
					const [error, user] = await services.userService.getCurrentUser(
						refreshedSession?.access_token,
					);
					if (error || !user) {
						debug.error(error || new Error("User not found"), {
							tokenLength: access_token.length,
						});
						return redirectToAuth();
					}

					debug.log("[Router] User authenticated successfully", {
						userId: user.id,
						email: user.email,
					});

					return redirectToApp();
				} catch (error) {
					debug.error(error as Error);
					return redirectToAuth();
				}
			},
		},
	]);
}
