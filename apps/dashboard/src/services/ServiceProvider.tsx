import type React from "react";
import { createContext, useContext } from "react";
import type { Services } from "./serviceInitialization";

/**
 * Interface defining the shape of the service context
 */

// Create the context with a default undefined value
const ServiceContext = createContext<Services | undefined>(undefined);

/**
 * Props for the ServiceProvider component
 */
interface ServiceProviderProps {
	children: React.ReactNode;
	services: Services;
}

/**
 * Provider component that makes the service instances available to all child components
 */
export function ServiceProvider({ children, services }: ServiceProviderProps) {
	return (
		<ServiceContext.Provider value={services}>
			{children}
		</ServiceContext.Provider>
	);
}

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
