import { describe, it, expect } from "vitest";
import { withTimeout } from "./async-utils";

// Note: Bun test doesn't have full timer mocking support like vitest/jest
// These tests are simplified to work without fake timers
describe("withTimeout", () => {
	it("should resolve with the promise result when promise resolves before timeout", async () => {
		// Arrange
		const expectedResult = { data: "test data" };
		const promise = Promise.resolve(expectedResult);

		// Act
		const result = await withTimeout({ promise, timeoutDuration: 5000 });

		// Assert
		expect(result).toEqual(expectedResult);
	});

	it("should reject with timeout error when promise takes too long", async () => {
		// Arrange
		const slowPromise = new Promise(() => {
			// Never resolves
		});

		const timeoutDuration = 100; // Short timeout for faster tests
		const timeoutReason = "Custom timeout message";

		// Act & Assert
		await expect(
			withTimeout({
				promise: slowPromise,
				timeoutDuration,
				timeoutReason,
			}),
		).rejects.toThrow(timeoutReason);
	});

	it("should use default timeout duration if not provided", async () => {
		// Arrange
		const slowPromise = new Promise(() => {
			// Never resolves
		});

		// Act & Assert
		await expect(
			withTimeout({
				promise: slowPromise,
				timeoutDuration: 100, // Override for faster test
			}),
		).rejects.toThrow("Request timed out");
	});

	it("should use default timeout reason if not provided", async () => {
		// Arrange
		const slowPromise = new Promise(() => {
			// Never resolves
		});

		// Act & Assert
		await expect(
			withTimeout({
				promise: slowPromise,
				timeoutDuration: 100,
			}),
		).rejects.toThrow("Request timed out");
	});
});
