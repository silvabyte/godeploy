import type { FastifyInstance } from "fastify";

export default async function (fastify: FastifyInstance) {
	fastify.get("/health", {
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						status: { type: "string" },
						timestamp: { type: "string" },
						version: { type: "string" },
					},
				},
			},
		},
		config: {
			auth: false, // Skip auth for health check
		},
		handler: async () => {
			return {
				status: "ok",
				timestamp: new Date().toISOString(),
				version: "1.0.0",
			};
		},
	});
}
