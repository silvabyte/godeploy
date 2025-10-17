import { redirect } from "react-router-dom";
import { config } from "../config";

interface AuthRedirectOptions {
	returnUrl?: string;
	preserveQuery?: boolean;
}

/**
 * Creates a redirect Response to the auth service with proper parameters
 */
export function redirectToAuth({
	returnUrl,
	preserveQuery = true,
}: AuthRedirectOptions = {}) {
	const currentUrl = new URL(window.location.href);
	const redirectUrl = returnUrl || currentUrl.toString();
	const search = new URLSearchParams();

	// Always include the redirect URL
	search.set("redirect_url", redirectUrl);

	// Optionally preserve existing query parameters
	if (preserveQuery) {
		currentUrl.searchParams.forEach((value, key) => {
			if (key !== "redirect_url") {
				search.append(key, value);
			}
		});
	}

	const url = `${config.VITE_AUTH_BASE_URL}?${search.toString()}`;
	document.location.href = url;
	return null;
}

/**
 * Creates a redirect Response to the main app
 */
export function redirectToApp(path: string = "/") {
	return redirect(path);
}
