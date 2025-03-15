import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DbService } from '../services/dbService';
import slugify from 'slugify';

// Define the request interface with proper typing
interface CreateProjectBody {
  name: string;
  description?: string;
}

// Define the schema for the projects endpoints
const projectsSchema = {
  schema: {
    security: [{ bearerAuth: [] }],
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

const createProjectSchema = {
  schema: {
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
      required: ['name'],
    },
    response: {
      201: {
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
      400: {
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
  // Initialize services
  const dbService = new DbService();

  // Get all projects for the authenticated tenant
  fastify.get('/api/projects', {
    ...projectsSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Extract tenant from auth middleware
        const { tenant_id } = request.user;

        // Get all projects for this tenant
        const projects = await dbService.getProjects(tenant_id);

        // Add URL to each project
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

  // Create a new project
  fastify.post('/api/projects', {
    ...createProjectSchema,
    handler: async (
      request: FastifyRequest<{
        Body: CreateProjectBody;
      }>,
      reply: FastifyReply
    ) => {
      try {
        // Extract user and tenant from auth middleware
        const { user_id, tenant_id } = request.user;

        // Get project name from request body
        const { name, description } = request.body;

        if (!name) {
          return reply.code(400).send({ error: 'Project name is required' });
        }

        // Generate subdomain from name
        const subdomain = slugify(name, {
          lower: true,
          strict: true,
        });

        // Check if project with this subdomain already exists
        const existingProject = await dbService.getProjectBySubdomain(
          subdomain
        );
        if (existingProject) {
          return reply.code(400).send({
            error: `Project with subdomain '${subdomain}' already exists`,
          });
        }

        // Create a new project
        const project = await dbService.createProject({
          tenant_id,
          owner_id: user_id,
          name,
          subdomain,
          description,
        });

        // Return the created project
        return reply.code(201).send({
          ...project,
          url: `https://${project.subdomain}.spa.godeploy.app`,
        });
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
