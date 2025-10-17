import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { initializeI18n } from "./i18n/i18nConfig";
import { ServiceProvider } from "./services/ServiceContext";
import { createRouter } from "./router/MainAppRoutes";
import "./styles.css";
import { createClient } from "@supabase/supabase-js";
import { config } from "./config";
import { JWT_STORAGE_KEY } from "./constants/auth.constants";
import { debug } from "./utils/debug";
import { AuthService } from "./services/auth/AuthService";
import { initTelemetry } from "./router/telemetry/telemetry";
/**
 * Main application entry point
 * Initializes services, i18n, and renders the React application
 */
const loadApp = async () => {
	initTelemetry();
	const i18nInitialized = await initializeI18n();
	if (!i18nInitialized) {
		debug.log("Failed to initialize i18n");
		return;
	}
	const client = createClient(
		config.VITE_SUPABASE_URL,
		config.VITE_SUPABASE_KEY,
		{
			auth: {
				storageKey: JWT_STORAGE_KEY,
				autoRefreshToken: true,
				persistSession: true,
				storage: localStorage,
				detectSessionInUrl: false,
			},
		},
	);
	// Initialize services
	const authService = new AuthService(client);

	// Create router with the auth service
	const router = createRouter(authService);

	// Initialize internationalization

	// Render the application with service provider
	createRoot(document.getElementById("root")!).render(
		<ServiceProvider authService={authService}>
			<RouterProvider router={router} />
		</ServiceProvider>,
	);
};

// Start the application
loadApp();
