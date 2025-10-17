import { createClient } from "@supabase/supabase-js";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { config } from "./config";
import { JWT_STORAGE_KEY } from "./constants/auth.constants";
import { FeatureFlags } from "./featureflags/ff";
import {
	getEnabledFlagNames,
	getFlagsFromQuery,
} from "./featureflags/queryParams";
import { initializeI18n } from "./i18n/i18n.config";
import { createRouter } from "./router/routes";
import { ServiceProvider } from "./services/ServiceProvider";
import { createServices } from "./services/serviceInitialization";
import { initTelemetry } from "./telemetry/telemetry";
import { debug } from "./utils/debug";

/**
 * Main application entry point
 * Initializes services, i18n, and renders the React application
 */
const loadApp = async () => {
	try {
		initTelemetry();
		// Initialize i18n first to ensure translations are available
		const i18nInitialized = await initializeI18n();
		if (!i18nInitialized) {
			debug.log(
				"[Main] Warning: Translations failed to initialize, falling back to defaults",
			);
		}

		// Initialize feature flags from URL if present
		const urlFlags = getFlagsFromQuery();
		if (urlFlags !== 0) {
			debug.log("[Main] Feature flags from URL:", getEnabledFlagNames());
		}
		// Initialize or update feature flags with URL values
		FeatureFlags.getInstance(localStorage, urlFlags);

		// Initialize services
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
		const services = createServices(client);

		// Create router with the auth service
		const router = createRouter(services);

		// Render the application with service provider
		ReactDOM.createRoot(document.getElementById("root")!).render(
			<ServiceProvider services={services}>
				<RouterProvider router={router} />
			</ServiceProvider>,
		);
	} catch (error) {
		debug.log("[Main] Error initializing application");
		debug.error(error as Error);
	}
};

// Start the application
loadApp();
