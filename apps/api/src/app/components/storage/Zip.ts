import { createReadStream, createWriteStream } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Unzip, UnzipInflate } from "fflate";

export async function extractZip(zipFile: string, to: string): Promise<void> {
	const resolvedTo = path.resolve(to);

	return new Promise<void>((resolve, reject) => {
		let pending = 0;
		let streamEnded = false;
		let settled = false;

		function fail(err: unknown) {
			if (settled) return;
			settled = true;
			rs.destroy();
			reject(err instanceof Error ? err : new Error(String(err)));
		}

		function checkDone() {
			if (streamEnded && pending === 0 && !settled) {
				settled = true;
				resolve();
			}
		}

		const uz = new Unzip();
		uz.register(UnzipInflate);

		uz.onfile = (file) => {
			if (file.name.endsWith("/")) return;

			const outPath = path.resolve(resolvedTo, file.name);
			if (
				!outPath.startsWith(`${resolvedTo}${path.sep}`) &&
				outPath !== resolvedTo
			) {
				fail(new Error(`Zip slip detected: ${file.name}`));
				return;
			}

			pending++;
			const dir = path.dirname(outPath);

			file.ondata = (err, data, final) => {
				if (settled) return;
				if (err) {
					fail(err);
					return;
				}
				if (data.length > 0) {
					ws.write(data);
				}
				if (final) {
					ws.end(() => {
						pending--;
						checkDone();
					});
				}
			};

			let ws: ReturnType<typeof createWriteStream>;

			fs.mkdir(dir, { recursive: true })
				.then(() => {
					if (settled) return;
					ws = createWriteStream(outPath);
					ws.on("error", fail);
					file.start();
				})
				.catch(fail);
		};

		const rs = createReadStream(zipFile, { highWaterMark: 65536 });
		rs.on("error", fail);
		rs.on("data", (chunk: Buffer) => {
			if (settled) return;
			try {
				uz.push(
					new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength),
					false,
				);
			} catch (err) {
				fail(err);
			}
		});
		rs.on("end", () => {
			if (settled) return;
			try {
				uz.push(new Uint8Array(0), true);
			} catch (err) {
				fail(err);
				return;
			}
			streamEnded = true;
			checkDone();
		});
	});
}
