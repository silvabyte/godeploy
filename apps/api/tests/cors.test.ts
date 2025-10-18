import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { buildApp } from "../src/app/build/build";

describe("CORS configuration", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		process.env.NODE_ENV = "production";
		process.env.APP_URL = "https://api.godeploy.app";
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it("allows *.godeploy.app origins", async () => {
		const app = await buildApp();
		const res = await app.inject({
			method: "OPTIONS",
			url: "/health",
			headers: {
				origin: "https://foo.godeploy.app",
				"access-control-request-method": "GET",
				"access-control-request-headers": "traceparent",
			},
		});
		// Should reflect the origin in Access-Control-Allow-Origin
		expect(res.headers["access-control-allow-origin"]).toBe(
			"https://foo.godeploy.app",
		);
		const allowHeaders = res.headers["access-control-allow-headers"];
		const normalizedHeaders = Array.isArray(allowHeaders)
			? allowHeaders.join(",")
			: allowHeaders;
		const headerValue = normalizedHeaders === undefined ? "" : String(normalizedHeaders);
		expect(headerValue.toLowerCase()).toContain("traceparent");
	});

	it("rejects non-godeploy.app origins in production", async () => {
		const app = await buildApp();
		const res = await app.inject({
			method: "OPTIONS",
			url: "/health",
			headers: {
				origin: "https://malicious.com",
				"access-control-request-method": "GET",
			},
		});
		// CORS header should not be present when origin not allowed
		expect(res.headers["access-control-allow-origin"]).toBeUndefined();
	});
});
