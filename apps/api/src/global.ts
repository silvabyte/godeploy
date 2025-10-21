import fs from "node:fs/promises";
import path from "node:path";
import { xdgCache, xdgConfig, xdgData, xdgState } from "xdg-basedir";

export const AppName = "godeploy-api";

const data = path.join(xdgData as string, AppName);
const cache = path.join(xdgCache as string, AppName);
const config = path.join(xdgConfig as string, AppName);
const state = path.join(xdgState as string, AppName);

export namespace Global {
	export const Path = {
		data,
		bin: path.join(data, "bin"),
		logs: path.join(data, "logs"),
		cache,
		config,
		state,
	} as const;
}

await Promise.all([
	fs.mkdir(Global.Path.data, { recursive: true }),
	fs.mkdir(Global.Path.config, { recursive: true }),
	fs.mkdir(Global.Path.state, { recursive: true }),
	fs.mkdir(Global.Path.logs, { recursive: true }),
	fs.mkdir(Global.Path.bin, { recursive: true }),
]);

const CACHE_VERSION = "9";

export const version = await Bun.file(path.join(Global.Path.cache, "version"))
	.text()
	.catch(() => "0");

if (version !== CACHE_VERSION) {
	try {
		const contents = await fs.readdir(Global.Path.cache);
		await Promise.all(
			contents.map((item) =>
				fs.rm(path.join(Global.Path.cache, item), {
					recursive: true,
					force: true,
				}),
			),
		);
	} catch (_e) {}
	await Bun.file(path.join(Global.Path.cache, "version")).write(CACHE_VERSION);
}
