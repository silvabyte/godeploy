export const debug = {
	log: (message: string, context?: Record<string, unknown>) => {
		if (
			window?.localStorage &&
			window.localStorage.getItem("debug") === "true"
		) {
			const error = new Error();
			Error.captureStackTrace(error);

			console.group(message);
			if (context) {
				console.log("Context:", context);
			}
			console.log("Stack:", error.stack?.split("\n").slice(2).join("\n"));
			console.groupEnd();
		}
	},
	error: (error: Error | string, context?: Record<string, unknown>) => {
		console.log(error, context);
	},
};
