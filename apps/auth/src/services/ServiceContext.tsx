import type React from "react";
import { createContext, useContext } from "react";
import type { AuthService } from "./auth/AuthService";

/**
 * Custom hook to access the service context
 * @throws Error if used outside of a ServiceProvider
 */
export function useServices() {
	const context = useContext(ServiceContext);
	if (context === undefined) {
		throw new Error("useServices must be used within a ServiceProvider");
	}
	return context;
}

/**
 * Custom hook to access just the auth service
 * @throws Error if used outside of a ServiceProvider
 */
export function useAuthService() {
	const { authService } = useServices();
	return authService;
}

/**
 * Interface defining the shape of the service context
 */
interface ServiceContextType {
	authService: AuthService;
}

// Create the context with a default undefined value
const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

/**
 * Props for the ServiceProvider component
 */
interface ServiceProviderProps {
	children: React.ReactNode;
	authService: AuthService;
}

/**
 * Provider component that makes the service instances available to all child components
 */
export function ServiceProvider({
	children,
	authService,
}: ServiceProviderProps) {
	const value = {
		authService,
	};

	return (
		<ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
	);
}
