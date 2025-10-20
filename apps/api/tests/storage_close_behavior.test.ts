import { describe, expect, it } from "vitest";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";

import { StorageService } from "../src/app/components/storage/StorageService";

describe("StorageService.uploadDirectory dir.close() robustness", () => {
	it("walks directory and closes Dir without throwing", async () => {
		const root = await mkdtemp(path.join(tmpdir(), "godeploy-walk-"));
		const sub = path.join(root, "assets");
		await mkdir(sub, { recursive: true });
		await writeFile(path.join(root, "index.html"), "<!doctype html>");
		await writeFile(path.join(sub, "app.js"), "console.log(1)");

		const service = new StorageService();

		// Stub uploadFile to avoid network and always succeed
		type StorageServiceTesting = {
			uploadFile: (
				file: string,
				key: string,
			) => Promise<{ data: string | null; error: string | null }>;
			uploadDirectory: (
				dirPath: string,
				baseKey: string,
			) => Promise<{ data: string | null; error: string | null }>;
		};
		const internalService = service as unknown as StorageServiceTesting;
		const origUpload = internalService.uploadFile;
		internalService.uploadFile = async () => ({ data: "", error: null });

		try {
			const res = await internalService.uploadDirectory(root, "test/base");
			expect(res.error).toBeNull();
		} finally {
			// Restore stubs and cleanup
			internalService.uploadFile = origUpload;
			await rm(root, { recursive: true, force: true });
		}
	});
});
