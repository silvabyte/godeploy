import { buildApp } from "./app/build/build.js";

// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Starts the server on the specified host and port
 */
async function startServer() {
	const host = process.env.HOST ?? "localhost";
	const port = process.env.PORT ? Number(process.env.PORT) : 38444;

	const server = await buildApp();

	// Start listening.
	server.listen({ port, host }, (err) => {
		if (err) {
			server.log.error(err);
			process.exit(1);
		} else {
		}
	});
}

startServer().catch((_err) => {
	process.exit(1);
});
