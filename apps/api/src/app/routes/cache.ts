import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function (fastify: FastifyInstance) {
	// ===== STUB ENDPOINTS - Priority 8: Cache Management =====

	// Clear entire CDN cache for a project
	fastify.post("/api/projects/:projectId/cache/clear", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Clear cache endpoint coming soon",
			});
		},
	});

	// Purge specific path from cache
	fastify.post("/api/projects/:projectId/cache/purge", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Purge cache path endpoint coming soon",
			});
		},
	});

	// Get cache statistics
	fastify.get("/api/projects/:projectId/cache/stats", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Cache statistics endpoint coming soon",
			});
		},
	});
}
