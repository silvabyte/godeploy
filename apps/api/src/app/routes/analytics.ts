import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function (fastify: FastifyInstance) {
	// Get analytics dashboard URL
	fastify.get("/api/projects/:projectId/analytics", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Analytics dashboard endpoint coming soon",
			});
		},
	});

	// Get analytics data
	fastify.get("/api/projects/:projectId/analytics/data", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Analytics data endpoint coming soon",
			});
		},
	});
}
