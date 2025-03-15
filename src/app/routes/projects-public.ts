import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DbService } from '../services/dbService';

// Define the schema for the projects endpoint
const projectsSchema = {
  schema: {
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            subdomain: { type: 'string' },
            url: { type: 'string' },
            created_at: { type: 'string' },
            updated_at: { type: 'string' },
          },
        },
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
      500: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
};

export default async function (fastify: FastifyInstance) {
  // Initialize database service
  const dbService = new DbService();

  fastify.get('/api/projects-public', {
    ...projectsSchema,
    config: {
      auth: false, // Skip auth for this public endpoint
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // For testing, use fixed tenant ID
        const tenant_id = request.user.tenant_id;

        // Get all projects for this tenant
        const projects = await dbService.getProjects(tenant_id);

        // Transform the response to include the URL
        const projectsWithUrl = projects.map((project) => ({
          ...project,
          url: `https://${project.subdomain}.spa.godeploy.app`,
        }));

        return reply.code(200).send(projectsWithUrl);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });
}
