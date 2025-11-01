export const debug = {
	log: (message: string, context?: unknown) => {
		if (
			typeof window !== "undefined" &&
			window?.localStorage &&
			window.localStorage.getItem("debug") === "true"
		) {
			// eslint-disable-next-line no-console
			console.log("[DEBUG]", message, context ?? "");
		}
	},
	error: (error: Error | string, context?: unknown) => {
		if (
			typeof window !== "undefined" &&
			window?.localStorage &&
			window.localStorage.getItem("debug") === "true"
		) {
			const errorMessage = typeof error === "string" ? error : error.message;
			const errorStack =
				typeof error === "string" ? new Error().stack : error.stack;
			// eslint-disable-next-line no-console
			console.error("[DEBUG]", errorMessage, context ?? "", errorStack ?? "");
		}
	},
};
