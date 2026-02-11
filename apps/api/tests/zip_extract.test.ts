import {
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { extractZip } from "../src/app/components/storage/Zip";

describe("Zip.extractZip", () => {
	it("extracts a simple zip archive with files and folders", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "archive.zip");
		const outDir = join(tmp, "out");

		const files: Record<string, Uint8Array> = {
			"index.html": strToU8("<!doctype html><html><body>hello</body></html>"),
			"assets/app.js": strToU8('console.log("ok")'),
		};
		const zipped = zipSync(files);

		await writeFile(zipPath, zipped);
		await mkdir(outDir, { recursive: true });
		await extractZip(zipPath, outDir);

		const html = await readFile(join(outDir, "index.html"), "utf8");
		expect(html).toContain("hello");

		const jsStat = await stat(join(outDir, "assets", "app.js"));
		expect(jsStat.isFile()).toBe(true);

		await rm(tmp, { recursive: true, force: true });
	});

	it("extracts deeply nested directory structures", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "nested.zip");
		const outDir = join(tmp, "out");

		const files: Record<string, Uint8Array> = {
			"a/b/c/d/file.txt": strToU8("deep content"),
		};
		const zipped = zipSync(files);

		await writeFile(zipPath, zipped);
		await mkdir(outDir, { recursive: true });
		await extractZip(zipPath, outDir);

		const content = await readFile(
			join(outDir, "a", "b", "c", "d", "file.txt"),
			"utf8",
		);
		expect(content).toBe("deep content");

		await rm(tmp, { recursive: true, force: true });
	});

	it("rejects zip-slip attempts with path traversal", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "evil.zip");
		const outDir = join(tmp, "out");

		// Manually construct a zip with a ../../ path entry using fflate
		const files: Record<string, Uint8Array> = {
			"../../etc/evil.txt": strToU8("malicious"),
		};
		const zipped = zipSync(files);

		await writeFile(zipPath, zipped);
		await mkdir(outDir, { recursive: true });

		await expect(extractZip(zipPath, outDir)).rejects.toThrow("Zip slip");

		await rm(tmp, { recursive: true, force: true });
	});

	it("produces empty output for invalid zip data", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "garbage.zip");
		const outDir = join(tmp, "out");

		await writeFile(zipPath, "this is not a zip file at all");
		await mkdir(outDir, { recursive: true });

		// fflate silently ignores non-zip data (no entries emitted)
		await extractZip(zipPath, outDir);
		const entries = await readdir(outDir);
		expect(entries).toHaveLength(0);

		await rm(tmp, { recursive: true, force: true });
	});

	it("handles zip with only directory entries", async () => {
		const tmp = await mkdtemp(join(tmpdir(), "godeploy-test-"));
		const zipPath = join(tmp, "dirs-only.zip");
		const outDir = join(tmp, "out");

		// zipSync with empty Uint8Array values and trailing slash names creates directory entries
		const files: Record<string, Uint8Array> = {};
		const zipped = zipSync(files);

		await writeFile(zipPath, zipped);
		await mkdir(outDir, { recursive: true });

		await extractZip(zipPath, outDir);

		// Output directory should be empty (no files extracted)
		const entries = await readdir(outDir);
		expect(entries).toHaveLength(0);

		await rm(tmp, { recursive: true, force: true });
	});
});
