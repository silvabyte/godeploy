import { render, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AuthService } from "./auth/AuthService";
import { createMockAuthService } from "./auth/testUtils";
import { ServiceProvider, useAuthService, useServices } from "./ServiceContext";

describe("ServiceContext", () => {
	describe("ServiceProvider", () => {
		it("should render children", () => {
			// Arrange
			const authService = createMockAuthService() as unknown as AuthService;
			const TestComponent = () => (
				<div data-testid="test-child">Test Child</div>
			);

			// Act
			const { getByTestId } = render(
				<ServiceProvider authService={authService}>
					<TestComponent />
				</ServiceProvider>,
			);

			// Assert
			expect(getByTestId("test-child")).toBeDefined();
		});
	});

	describe("useServices", () => {
		it("should return the services from context", () => {
			// Arrange
			const authService = createMockAuthService() as unknown as AuthService;

			// Act
			const { result } = renderHook(() => useServices(), {
				wrapper: ({ children }) => (
					<ServiceProvider authService={authService}>
						{children}
					</ServiceProvider>
				),
			});

			// Assert
			expect(result.current).toEqual({ authService });
		});

		it("should throw an error when used outside of ServiceProvider", () => {
			// Arrange & Act & Assert
			expect(() => {
				renderHook(() => useServices());
			}).toThrow("useServices must be used within a ServiceProvider");
		});
	});

	describe("useAuthService", () => {
		it("should return the auth service from context", () => {
			// Arrange
			const authService = createMockAuthService() as unknown as AuthService;

			// Act
			const { result } = renderHook(() => useAuthService(), {
				wrapper: ({ children }) => (
					<ServiceProvider authService={authService}>
						{children}
					</ServiceProvider>
				),
			});

			// Assert
			expect(result.current).toBe(authService);
		});

		it("should throw an error when used outside of ServiceProvider", () => {
			// Arrange & Act & Assert
			expect(() => {
				renderHook(() => useAuthService());
			}).toThrow("useServices must be used within a ServiceProvider");
		});
	});
});
