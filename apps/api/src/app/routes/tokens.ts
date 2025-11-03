import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function (fastify: FastifyInstance) {
	// ===== STUB ENDPOINTS - Priority 7: API Tokens =====

	// List all API tokens for user
	fastify.get("/api/tokens", {
		config: { auth: true },
		handler: async (request: FastifyRequest, reply: FastifyReply) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "List API tokens endpoint coming soon",
			});
		},
	});

	// Create a new API token
	fastify.post("/api/tokens", {
		config: { auth: true },
		handler: async (request: FastifyRequest, reply: FastifyReply) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Create API token endpoint coming soon",
			});
		},
	});

	// Get token details
	fastify.get("/api/tokens/:tokenId", {
		config: { auth: true },
		handler: async (
			request: FastifyRequest<{ Params: { tokenId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Get API token details endpoint coming soon",
			});
		},
	});

	// Revoke API token
	fastify.delete("/api/tokens/:tokenId", {
		config: { auth: true },
		handler: async (
			request: FastifyRequest<{ Params: { tokenId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Revoke API token endpoint coming soon",
			});
		},
	});

	// Update token (e.g., name)
	fastify.patch("/api/tokens/:tokenId", {
		config: { auth: true },
		handler: async (
			request: FastifyRequest<{ Params: { tokenId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Update API token endpoint coming soon",
			});
		},
	});
}
