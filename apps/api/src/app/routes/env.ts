import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function (fastify: FastifyInstance) {
	// List environment variables for a project
	fastify.get("/api/projects/:projectId/env", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "List environment variables endpoint coming soon",
			});
		},
	});

	// Set environment variable
	fastify.post("/api/projects/:projectId/env", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Set environment variable endpoint coming soon",
			});
		},
	});

	// Get specific environment variable
	fastify.get("/api/projects/:projectId/env/:key", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string; key: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Get environment variable endpoint coming soon",
			});
		},
	});

	// Delete environment variable
	fastify.delete("/api/projects/:projectId/env/:key", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string; key: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Delete environment variable endpoint coming soon",
			});
		},
	});
}
