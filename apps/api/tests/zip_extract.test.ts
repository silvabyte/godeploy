import {
	mkdir,
	mkdtemp,
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

		// Create a small zip in-memory
		const files: Record<string, Uint8Array> = {
			"index.html": strToU8("<!doctype html><html><body>hello</body></html>"),
			"assets/app.js": strToU8('console.log("ok")'),
		};
		const zipped = zipSync(files);

		await writeFile(zipPath, zipped);

		// Ensure out dir exists (unzipper will create it if needed, but be explicit)
		await mkdir(outDir, { recursive: true });

		await extractZip(zipPath, outDir);

		// Verify extracted files
		const html = await readFile(join(outDir, "index.html"), "utf8");
		expect(html).toContain("hello");

		const jsStat = await stat(join(outDir, "assets", "app.js"));
		expect(jsStat.isFile()).toBe(true);

		// cleanup
		await rm(tmp, { recursive: true, force: true });
	});
});
