import * as HyperDx from "@hyperdx/node-opentelemetry";
import pino from "pino";
import { AppName } from "../global";

export namespace Log {
	const targets: any[] = [
		{
			target: "pino-pretty",
		},
	];

	export const transport = pino.transport({
		level: process.env.LOG_LEVEL ?? "debug",
		targets,
	});

	// Base logger instance
	const baseInstance = pino(Log.transport).child({
		app: AppName,
	});

	// Export enriched instance
	export const instance = baseInstance;

	// Helper to get current trace context

	export const info = instance.info.bind(instance);
	export const debug = instance.debug.bind(instance);
	export const error = instance.error.bind(instance);
	export const warn = instance.warn.bind(instance);
	export const fatal = instance.fatal.bind(instance);
	export const trace = instance.trace.bind(instance);
	export const child = instance.child.bind(instance);
	export const level = instance.level;
}
