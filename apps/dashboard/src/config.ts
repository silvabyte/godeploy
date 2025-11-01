export const config = {
	VITE_DASHBOARD_BASE_URL: import.meta.env.VITE_DASHBOARD_BASE_URL as string,
	VITE_SUPABASE_PROJECT_KEY: import.meta.env
		.VITE_SUPABASE_PROJECT_KEY as string,
	VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string,
	VITE_SUPABASE_KEY: import.meta.env.VITE_SUPABASE_KEY as string,
	VITE_AUTH_BASE_URL: import.meta.env.VITE_AUTH_BASE_URL as string,
	VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string | undefined,
};
