import { vi } from "vitest";

/**
 * Creates a mock AuthService for testing with properly mocked functions
 */
export function createMockAuthService() {
	return {
		getCurrentUser: vi.fn(),
		getSession: vi.fn(),
		signInWithEmail: vi.fn(),
		signInWithPassword: vi.fn(),
		verifyOTP: vi.fn(),
		logout: vi.fn(),
		// Add missing properties required by AuthService type
		client: {},
		authBaseUrl: "http://localhost:5173",
		timeoutDuration: 10000,
		timeoutInSeconds: 10,
	};
}
