import { debug } from "./debug";

/**
 * Adds a query parameter to a URL, handling existing parameters correctly
 * @param baseUrl The base URL to add the parameter to
 * @param paramName The name of the parameter to add
 * @param paramValue The value of the parameter to add
 * @returns The URL with the new parameter added
 */
export function addQueryParam(
	baseUrl: string,
	paramName: string,
	paramValue: string,
): string {
	try {
		const url = new URL(baseUrl);
		url.searchParams.append(paramName, paramValue);
		return url.toString();
	} catch (error: unknown) {
		debug.error("[URL Utils] Error adding query param:", { error });
		// Fallback to simple string manipulation if URL parsing fails
		const separator = baseUrl.includes("?") ? "&" : "?";
		return `${baseUrl}${separator}${paramName}=${encodeURIComponent(paramValue)}`;
	}
}

/**
 * Adds multiple query parameters to a URL
 * @param baseUrl The base URL to add parameters to
 * @param params Object containing parameter names and values
 * @returns The URL with all parameters added
 */
export function addQueryParams(
	baseUrl: string,
	params: Record<string, string>,
): string {
	return Object.entries(params).reduce(
		(url, [name, value]) => addQueryParam(url, name, value),
		baseUrl,
	);
}

/**
 * Gets URL parameters from the hash fragment
 */
export function getHashParams(): URLSearchParams {
	const hashFragment =
		typeof window !== "undefined" ? window.location.hash : "";
	return new URLSearchParams(hashFragment.replace(/^#/, "").split("#")[0]);
}
