import { describe, it, vi } from "vitest";

// Mock the redirect function from react-router-dom
vi.mock("react-router-dom", () => {
	const mockRedirect = vi
		.fn()
		.mockImplementation((url) => ({ type: "redirect", url }));
	return {
		redirect: mockRedirect,
	};
});

describe("redirectUtils", () => {
	it.skip("should redirect to the app when the user is authenticated", () => {
		//TODO: Implement this test
	});
});
