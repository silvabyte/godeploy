import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function (fastify: FastifyInstance) {
	// Get build configuration for a project
	fastify.get("/api/projects/:projectId/builds/config", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Get build configuration endpoint coming soon",
			});
		},
	});

	// Set build configuration for a project
	fastify.post("/api/projects/:projectId/builds/config", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Set build configuration endpoint coming soon",
			});
		},
	});

	// Trigger a build
	fastify.post("/api/projects/:projectId/builds/run", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Trigger build endpoint coming soon",
			});
		},
	});

	// Get build history
	fastify.get("/api/projects/:projectId/builds/history", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{ Params: { projectId: string } }>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Build history endpoint coming soon",
			});
		},
	});

	// Get build logs
	fastify.get("/api/projects/:projectId/builds/:buildId/logs", {
		config: { auth: true },
		handler: async (
			_request: FastifyRequest<{
				Params: { projectId: string; buildId: string };
			}>,
			reply: FastifyReply,
		) => {
			return reply.code(501).send({
				error: "Not implemented yet",
				message: "Build logs endpoint coming soon",
			});
		},
	});
}
