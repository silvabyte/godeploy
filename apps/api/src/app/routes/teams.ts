import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function (fastify: FastifyInstance) {
	// List all teams for user
	fastify.get("/api/teams", {
		config: { auth: true },
		handler: async (_request: FastifyRequest, reply: FastifyReply) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "List teams endpoint coming soon",
			});
		},
	});

	// Create a new team
	fastify.post("/api/teams", {
		config: { auth: true },
		handler: async (_request: FastifyRequest, reply: FastifyReply) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Create team endpoint coming soon",
			});
		},
	});

	// Get team details
	fastify.get("/api/teams/:teamId", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { teamId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Get team details endpoint coming soon",
			});
		},
	});

	// Update team
	fastify.patch("/api/teams/:teamId", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { teamId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Update team endpoint coming soon",
			});
		},
	});

	// Delete team
	fastify.delete("/api/teams/:teamId", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { teamId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Delete team endpoint coming soon",
			});
		},
	});

	// List team members
	fastify.get("/api/teams/:teamId/members", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { teamId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "List team members endpoint coming soon",
			});
		},
	});

	// Invite team member
	fastify.post("/api/teams/:teamId/members", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { teamId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Invite team member endpoint coming soon",
			});
		},
	});

	// Remove team member
	fastify.delete("/api/teams/:teamId/members/:userId", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { teamId: string; userId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Remove team member endpoint coming soon",
			});
		},
	});
}
