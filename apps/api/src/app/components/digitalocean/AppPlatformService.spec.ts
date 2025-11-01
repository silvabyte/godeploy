import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DigitalOceanAppPlatformService } from "./AppPlatformService";

type ServiceConstructor = new (
	token: string,
	appId: string,
	cdnId?: string,
) => DigitalOceanAppPlatformService;

describe("DigitalOceanAppPlatformService", () => {
	let service: DigitalOceanAppPlatformService;
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		// Create a fresh service instance using the private constructor
		const ServiceClass =
			DigitalOceanAppPlatformService as unknown as ServiceConstructor;
		service = new ServiceClass("test-token", "test-app-id", "test-cdn-id");

		// Mock global fetch
		fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe("purgeCDNCache", () => {
		it("should successfully purge all cache when no files specified", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 204,
				json: async () => ({}),
			});

			const result = await service.purgeCDNCache();

			expect(result.ok).toBe(true);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.digitalocean.com/v2/cdn/endpoints/test-cdn-id/cache",
				expect.objectContaining({
					method: "DELETE",
					headers: expect.objectContaining({
						Authorization: "Bearer test-token",
						"Content-Type": "application/json",
						Accept: "application/json",
					}),
					body: JSON.stringify({ files: ["*"] }),
				}),
			);
		});

		it("should successfully purge specific files", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: true,
				status: 204,
				json: async () => ({}),
			});

			const filesToPurge = ["path/to/file.js", "assets/*"];
			const result = await service.purgeCDNCache(filesToPurge);

			expect(result.ok).toBe(true);
			expect(fetchMock).toHaveBeenCalledWith(
				"https://api.digitalocean.com/v2/cdn/endpoints/test-cdn-id/cache",
				expect.objectContaining({
					method: "DELETE",
					body: JSON.stringify({ files: filesToPurge }),
				}),
			);
		});

		it("should return error when CDN ID is not configured", async () => {
			// Create service without CDN ID
			const ServiceClass =
				DigitalOceanAppPlatformService as unknown as ServiceConstructor;
			const serviceNoCdn = new ServiceClass(
				"test-token",
				"test-app-id",
				undefined,
			);

			const result = await serviceNoCdn.purgeCDNCache();

			expect(result.ok).toBe(false);
			expect(result.error).toContain(
				"CDN ID not configured. Set DIGITAL_OCEAN_SPACES_CDN_ID environment variable.",
			);
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it("should handle API errors gracefully", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: async () => ({ message: "Internal server error" }),
			});

			const result = await service.purgeCDNCache();

			expect(result.ok).toBe(false);
			expect(result.error).toContain("500");
		});

		it("should handle network errors gracefully", async () => {
			fetchMock.mockRejectedValueOnce(new Error("Network error"));

			const result = await service.purgeCDNCache();

			expect(result.ok).toBe(false);
			expect(result.error).toContain("Network error");
		});

		it("should handle rate limit errors (429)", async () => {
			fetchMock.mockResolvedValueOnce({
				ok: false,
				status: 429,
				json: async () => ({ message: "Too many requests" }),
			});

			const result = await service.purgeCDNCache();

			expect(result.ok).toBe(false);
			expect(result.error).toContain("429");
		});
	});

	describe("fromEnv", () => {
		const originalEnv = { ...process.env };

		beforeEach(() => {
			// Reset to original env
			process.env = { ...originalEnv };
		});

		afterEach(() => {
			// Restore original env
			process.env = originalEnv;
		});

		it("should create service with all environment variables set", () => {
			process.env.DIGITAL_OCEAN_TOKEN = "env-token";
			process.env.DIGITAL_OCEAN_NGINX_APP_ID = "env-app-id";
			process.env.DIGITAL_OCEAN_SPACES_CDN_ID = "env-cdn-id";

			const service = DigitalOceanAppPlatformService.fromEnv();

			expect(service).not.toBeNull();
		});

		it("should return null when token is missing", () => {
			delete process.env.DIGITAL_OCEAN_TOKEN;
			process.env.DIGITAL_OCEAN_NGINX_APP_ID = "env-app-id";

			const service = DigitalOceanAppPlatformService.fromEnv();

			expect(service).toBeNull();
		});

		it("should return null when app ID is missing", () => {
			process.env.DIGITAL_OCEAN_TOKEN = "env-token";
			delete process.env.DIGITAL_OCEAN_NGINX_APP_ID;
			delete process.env.DIGITAL_OCEAN_APP_ID;

			const service = DigitalOceanAppPlatformService.fromEnv();

			expect(service).toBeNull();
		});

		it("should create service even when CDN ID is missing (for backward compat)", () => {
			process.env.DIGITAL_OCEAN_TOKEN = "env-token";
			process.env.DIGITAL_OCEAN_NGINX_APP_ID = "env-app-id";
			delete process.env.DIGITAL_OCEAN_SPACES_CDN_ID;

			const service = DigitalOceanAppPlatformService.fromEnv();

			expect(service).not.toBeNull();
		});
	});
});
