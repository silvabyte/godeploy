import { beforeEach, describe, it, vi } from "vitest";

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

describe("SessionAuthenticate", () => {
	beforeEach(() => {
		// Setup localStorage mock
		Object.defineProperty(window, "localStorage", { value: localStorageMock });
		localStorageMock.clear();

		// Reset mocks
		vi.clearAllMocks();

		// Reset window.location.hash
		Object.defineProperty(window, "location", {
			value: { hash: "" },
			writable: true,
		});
	});

	it.skip("should redirect to the dashboard when the user is authenticated", async () => {
		//TODO: Implement this test
	});
});
