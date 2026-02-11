import { createReadStream, createWriteStream } from "node:fs";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { pipeline } from "node:stream/promises";
import { to } from "await-to-js";
import { Unzip, UnzipInflate, UnzipPassThrough } from "fflate";

interface Result<T> {
	data: T | null;
	error: string | null;
}

/**
 * Save a readable stream to a temporary file
 * @param stream Readable stream
 * @param filename Filename to use in the temp directory
 */
export async function saveStreamToTemp(
	stream: NodeJS.ReadableStream,
	filename: string,
): Promise<Result<string>> {
	const [mkdirErr, tempDir] = await to(
		fs.mkdtemp(path.join(os.tmpdir(), "godeploy-")),
	);
	if (mkdirErr) {
		return {
			data: null,
			error: `Failed to create temp directory: ${mkdirErr.message}`,
		};
	}

	const filePath = path.join(tempDir, filename);
	const writeStream = createWriteStream(filePath);
	const [pipeErr] = await to(pipeline(stream, writeStream));
	if (pipeErr) {
		return {
			data: null,
			error: `Failed to write stream: ${pipeErr instanceof Error ? pipeErr.message : "Unknown stream error"}`,
		};
	}

	return { data: filePath, error: null };
}

/**
 * Validate a SPA archive file
 * Checks that the archive contains static files
 * @param archivePath Path to the archive file
 * @returns Result containing validation status
 */
export async function validateSpaArchive(
	archivePath: string,
): Promise<Result<boolean>> {
	return new Promise<Result<boolean>>((resolve) => {
		let settled = false;

		function settle(result: Result<boolean>) {
			if (settled) return;
			settled = true;
			rs.destroy();
			resolve(result);
		}

		const uz = new Unzip();
		uz.register(UnzipPassThrough);
		uz.register(UnzipInflate);

		uz.onfile = (file) => {
			file.ondata = () => {};
			file.start();

			if (!file.name.endsWith("/")) {
				settle({ data: true, error: null });
			}
		};

		const rs = createReadStream(archivePath, { highWaterMark: 65536 });

		rs.on("error", (err) => {
			settle({
				data: null,
				error: err instanceof Error ? err.message : String(err),
			});
		});

		rs.on("data", (chunk: Buffer) => {
			if (settled) return;
			try {
				uz.push(
					new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength),
					false,
				);
			} catch {
				settle({ data: null, error: "Invalid or corrupt archive file" });
			}
		});

		rs.on("end", () => {
			if (settled) return;
			try {
				uz.push(new Uint8Array(0), true);
			} catch {
				settle({ data: null, error: "Invalid or corrupt archive file" });
				return;
			}
			settle({
				data: false,
				error:
					"Archive is empty. Please ensure your static files are included.",
			});
		});
	});
}
