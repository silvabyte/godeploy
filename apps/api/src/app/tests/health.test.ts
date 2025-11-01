import { beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../build/build.js";

describe("Health check", () => {
	let server: Awaited<ReturnType<typeof buildApp>>;

	beforeAll(async () => {
		process.env.SUPABASE_URL = "https://test.supabase.co";
		process.env.SUPABASE_API_KEY = "test-key";
		server = await buildApp();
	});

	it("should return 200", async () => {
		const response = await server.inject({
			method: "GET",
			url: "/health",
		});
		expect(response.statusCode).toBe(200);
	});
});
