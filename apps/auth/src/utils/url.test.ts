import { describe, it, expect } from "vitest";
import { addQueryParam, addQueryParams } from "./url";

describe("URL Utils", () => {
	describe("addQueryParam", () => {
		it("should add a query parameter to a URL without existing parameters", () => {
			const result = addQueryParam("https://example.com", "test", "value");
			expect(result).toBe("https://example.com/?test=value");
		});

		it("should add a query parameter to a URL with existing parameters", () => {
			const result = addQueryParam(
				"https://example.com/?existing=true",
				"test",
				"value",
			);
			expect(result).toBe("https://example.com/?existing=true&test=value");
		});

		it("should handle URLs with hash fragments", () => {
			const result = addQueryParam(
				"https://example.com/#hash",
				"test",
				"value",
			);
			expect(result).toBe("https://example.com/?test=value#hash");
		});

		it("should properly encode parameter values", () => {
			const result = addQueryParam(
				"https://example.com",
				"redirect",
				"https://other.com?param=value",
			);
			expect(result).toBe(
				"https://example.com/?redirect=https%3A%2F%2Fother.com%3Fparam%3Dvalue",
			);
		});

		it("should handle invalid URLs gracefully", () => {
			const result = addQueryParam("not-a-url", "test", "value");
			expect(result).toBe("not-a-url?test=value");
		});
	});

	describe("addQueryParams", () => {
		it("should add multiple query parameters to a URL", () => {
			const result = addQueryParams("https://example.com?existing=true", {
				param1: "value1",
				param2: "value2",
			});
			expect(result).toBe(
				"https://example.com/?existing=true&param1=value1&param2=value2",
			);
		});

		it("should handle empty params object", () => {
			const result = addQueryParams("https://example.com", {});
			expect(result).toBe("https://example.com");
		});

		it("should preserve existing query parameters", () => {
			const result = addQueryParams("https://example.com/?existing=true", {
				param1: "value1",
				param2: "value2",
			});
			expect(result).toBe(
				"https://example.com/?existing=true&param1=value1&param2=value2",
			);
		});
	});
});
