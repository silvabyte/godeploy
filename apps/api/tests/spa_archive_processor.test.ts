import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { validateSpaArchive } from "../src/app/components/storage/SpaArchiveProcessor";

describe("SpaArchiveProcessor.validateSpaArchive", () => {
	it("returns true for a valid zip with files", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "valid.zip");

		const zipped = zipSync({
			"index.html": strToU8("<!doctype html><html></html>"),
		});
		await writeFile(zipPath, zipped);

		const result = await validateSpaArchive(zipPath);
		expect(result).toEqual({ data: true, error: null });

		await rm(tmp, { recursive: true, force: true });
	});

	it("returns empty error for a zip with no entries", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "empty.zip");

		const zipped = zipSync({});
		await writeFile(zipPath, zipped);

		const result = await validateSpaArchive(zipPath);
		expect(result.data).toBe(false);
		expect(result.error).toContain("Archive is empty");

		await rm(tmp, { recursive: true, force: true });
	});

	it("returns empty error for an invalid (non-zip) file", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "bad.zip");

		await writeFile(zipPath, "not a zip file");

		// fflate silently ignores non-zip data (no entries emitted),
		// so this is treated the same as an empty archive
		const result = await validateSpaArchive(zipPath);
		expect(result.data).toBe(false);
		expect(result.error).toContain("Archive is empty");

		await rm(tmp, { recursive: true, force: true });
	});

	it("returns empty error for a zip with only directory entries", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "dirs.zip");

		// An empty zipSync produces a zip with no entries at all
		const zipped = zipSync({});
		await writeFile(zipPath, zipped);

		const result = await validateSpaArchive(zipPath);
		expect(result.data).toBe(false);
		expect(result.error).toContain("Archive is empty");

		await rm(tmp, { recursive: true, force: true });
	});
});
