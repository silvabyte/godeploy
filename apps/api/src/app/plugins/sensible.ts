import sensible from "@fastify/sensible";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async (fastify: FastifyInstance) => {
	fastify.register(sensible);

	// Add error handler for validation errors
	fastify.setErrorHandler((error, _request, reply) => {
		// Handle validation errors
		if (error.validation) {
			// Prefer the first validation message if available
			const validationMessage =
				Array.isArray(error.validation) && error.validation[0]?.message
					? String(error.validation[0].message)
					: "Validation error";

			fastify.log.warn({ validation: error.validation }, "Validation error");

			// Include success:false to satisfy auth route schemas; extra properties are ignored elsewhere
			reply.status(400).send({
				success: false,
				error: validationMessage,
			});
			return;
		}

		// Handle other errors
		const statusCode = error.statusCode || 500;
		// For 5xx responses, our route schemas typically require { error, message }
		// Use a generic high-level error and include the specific message
		if (statusCode >= 500) {
			fastify.log.error(error, "Unhandled error");
			reply.status(statusCode).send({
				error: "Internal server error",
				message: error.message || "An unexpected error occurred",
			});
			return;
		}

		// For other non-validation client errors, send a simple shape
		reply.status(statusCode).send({
			error: error.message || "Request error",
		});
	});
});
