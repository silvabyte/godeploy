/**
 * Simple API client for making HTTP requests to the GoDeploy API
 * This is a minimal implementation to support React Query hooks
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:38444/api";

interface RequestOptions {
	method?: string;
	headers?: Record<string, string>;
	body?: unknown;
}

async function request<T>(
	endpoint: string,
	options: RequestOptions = {},
): Promise<{ data: T }> {
	const { method = "GET", headers = {}, body } = options;

	// Get auth token from localStorage (or wherever it's stored)
	const token = localStorage.getItem("auth_token");

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...headers,
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({
			error: "Request failed",
		}));
		throw new Error(error.error || `HTTP ${response.status}`);
	}

	const data = await response.json();
	return { data };
}

export const api = {
	get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
	post: <T>(endpoint: string, body?: unknown) =>
		request<T>(endpoint, { method: "POST", body }),
	patch: <T>(endpoint: string, body?: unknown) =>
		request<T>(endpoint, { method: "PATCH", body }),
	delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
