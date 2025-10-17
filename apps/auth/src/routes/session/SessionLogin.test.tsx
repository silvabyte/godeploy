import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, waitFor } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import Login from "./SessionLogin";
import { createLoginAction } from "./actions";
import { createMockAuthService } from "../../services/auth/testUtils";
import {
	REDIRECT_URL_PARAM,
	REDIRECT_URL_STORAGE_KEY,
} from "../../constants/auth.constants";
import { ActionFunctionArgs } from "react-router-dom";
import { AuthService } from "../../services/auth/AuthService";
// Setup jest-dom matchers
import "@testing-library/jest-dom";
import { config } from "../../config";

// Mock the matsilva/xtranslate module
vi.mock("@matsilva/xtranslate", () => ({
	t: vi.fn((key) => key),
}));

// Mock React Router hooks
vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useNavigation: vi.fn(() => ({ state: "idle" })),
		useFetcher: vi.fn(() => ({
			data: null,
			state: "idle",
			Form: ({
				children,
				...props
			}: React.FormHTMLAttributes<HTMLFormElement>) => (
				<form {...props}>{children}</form>
			),
			submit: vi.fn(),
		})),
		redirect: vi.fn((url) => ({ type: "redirect", url })),
	};
});

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] || null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
	};
})();

describe("SessionLogin", () => {
	beforeEach(() => {
		// Setup localStorage mock
		Object.defineProperty(window, "localStorage", { value: localStorageMock });
		localStorageMock.clear();

		// Reset mocks
		vi.clearAllMocks();
	});

	describe("Login component", () => {
		it("should render the login form", () => {
			// Arrange & Act
			render(
				<MemoryRouter>
					<Login />
				</MemoryRouter>,
			);

			// Assert
			expect(screen.getByText("session.signin.title")).toBeInTheDocument();
			expect(
				screen.getByLabelText("session.inputs.email.label"),
			).toBeInTheDocument();
			expect(screen.getByText("session.signin.loginLink")).toBeInTheDocument();
		});

		it("should capture and store redirect URL from query parameters", async () => {
			// Arrange
			const redirectUrl = `${config.VITE_DASHBOARD_BASE_URL}/api/auth/callback`;

			// Act
			render(
				<MemoryRouter
					initialEntries={[
						`/?${REDIRECT_URL_PARAM}=${encodeURIComponent(redirectUrl)}`,
					]}
				>
					<Login />
				</MemoryRouter>,
			);

			// Assert
			await waitFor(() => {
				expect(localStorageMock.setItem).toHaveBeenCalledWith(
					REDIRECT_URL_STORAGE_KEY,
					redirectUrl,
				);
			});
		});
	});

	describe("createLoginAction", () => {
		it("should call signInWithEmail with email and redirect URL", async () => {
			// Arrange
			const authService = createMockAuthService();
			authService.signInWithEmail.mockResolvedValue({ data: {}, error: null });

			const email = "test@example.com";
			const redirectUrl = `${config.VITE_DASHBOARD_BASE_URL}/api/auth/callback`;

			const formData = new FormData();
			formData.append("email", email);
			formData.append(REDIRECT_URL_PARAM, redirectUrl);

			const request = {
				formData: () => Promise.resolve(formData),
			} as unknown as Request;

			const loginAction = createLoginAction(
				authService as unknown as AuthService,
			);

			// Act
			await loginAction({ request } as ActionFunctionArgs);

			// Assert
			expect(authService.signInWithEmail).toHaveBeenCalledWith(
				email,
				redirectUrl,
			);
		});

		it("should return error when signInWithEmail fails", async () => {
			// Arrange
			const authService = createMockAuthService();
			const error = new Error("Authentication failed");
			authService.signInWithEmail.mockResolvedValue({ data: null, error });

			const email = "test@example.com";

			const formData = new FormData();
			formData.append("email", email);

			const request = {
				formData: () => Promise.resolve(formData),
			} as unknown as Request;

			const loginAction = createLoginAction(
				authService as unknown as AuthService,
			);

			// Act
			const result = await loginAction({ request } as ActionFunctionArgs);

			// Assert
			expect(result).toEqual({ error });
		});
	});
});
