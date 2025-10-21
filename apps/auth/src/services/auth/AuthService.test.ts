import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./AuthService";
import { SessionManager } from "./SessionManager";

type MockAuthMethods = {
	setSession: Mock;
	signInWithOtp: Mock;
	getUser: Mock;
	signOut: Mock;
	refreshSession: Mock;
};

interface MockSupabaseClient extends Partial<Omit<SupabaseClient, "auth">> {
	auth: MockAuthMethods;
}

describe("AuthService", () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	//@ts-expect-error - boo these types
	let authService: AuthService;
	let mockClient: MockSupabaseClient;
	let sessionManager: ReturnType<typeof SessionManager.getInstance>;

	beforeEach(() => {
		// Create mock Supabase client
		mockClient = {
			auth: {
				setSession: vi.fn(),
				signInWithOtp: vi.fn(),
				getUser: vi.fn(),
				signOut: vi.fn(),
				refreshSession: vi.fn(),
			},
		};

		// Get the mocked session manager instance
		sessionManager = SessionManager.getInstance();

		// Create auth service instance
		authService = new AuthService(mockClient as unknown as SupabaseClient, {
			config: {
				authBaseUrl: "http://localhost:3000",
				supabaseUrl: "http://localhost:54321",
				supabaseKey: "test-key",
			},
		});
	});

	describe("Session Management", () => {
		it("should set client session when SessionManager has a session on initialization", () => {
			const mockSession = { access_token: "test-token" } as Session;

			sessionManager.setSession(mockSession);

			expect(mockClient.auth.setSession).toHaveBeenCalledWith(mockSession);
		});

		it("should update client session when SessionManager session changes", () => {
			const mockSession = { access_token: "new-token" } as Session;

			sessionManager.setSession(mockSession);

			expect(mockClient.auth.setSession).toHaveBeenCalledWith(mockSession);
		});

		it("should clear session in client when SessionManager session is cleared", () => {
			sessionManager.clearSession();

			// The client should receive a null session
			expect(mockClient.auth.signOut).toHaveBeenCalled();
		});
	});
});
