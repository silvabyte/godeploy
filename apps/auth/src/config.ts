export const config = {
	VITE_SUPABASE_URL: import.meta.env["VITE_SUPABASE_URL"] as string,
	VITE_SUPABASE_KEY: import.meta.env["VITE_SUPABASE_KEY"] as string,
	VITE_SUPABASE_PROJECT_KEY: import.meta.env[
		"VITE_SUPABASE_PROJECT_KEY"
	] as string,
	VITE_AUTH_BASE_URL: import.meta.env["VITE_AUTH_BASE_URL"] as string,
	VITE_DASHBOARD_BASE_URL: import.meta.env["VITE_DASHBOARD_BASE_URL"] as string,
	VITE_BASE_ROUTER_PATH: import.meta.env["VITE_BASE_ROUTER_PATH"] as string,
};
