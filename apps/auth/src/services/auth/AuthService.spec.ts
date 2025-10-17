import { describe, vi, it } from "vitest";
import * as asyncUtils from "./async-utils";

// Spy on withTimeout
vi.spyOn(asyncUtils, "withTimeout").mockImplementation(
	({ promise }) => promise,
);

describe("AuthService", () => {
	//TODO: add tests for the auth service
	it.skip("should redirect to the app when the user is authenticated", () => {
		//TODO: Implement this test
	});
});
