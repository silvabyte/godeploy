import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DbService } from '../services/dbService';
import slugify from 'slugify';
import { constructCdnUrl } from '../utils/urlUtils';

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

  // Logger utility function
  const logRequest = (request: FastifyRequest, message: string) => {
    const authHeader = request.headers.authorization || 'none';
    const maskedAuth =
      authHeader !== 'none'
        ? `${authHeader.split(' ')[0]} ${authHeader
            .split(' ')[1]
            ?.substring(0, 10)}...`
        : 'none';

    fastify.log.info({
      route: request.url,
      method: request.method,
      auth: maskedAuth,
      reqId: request.id,
      userInfo: request.user
        ? `user_id: ${request.user.user_id.substring(
            0,
            8
          )}..., tenant_id: ${request.user.tenant_id.substring(0, 8)}...`
        : 'no user',
      message,
    });
  };

  // Get all projects for the authenticated tenant
  fastify.get('/api/projects', {
    ...projectsSchema,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      logRequest(request, 'GET projects request received');

      try {
        // Extract tenant from auth middleware
        const { tenant_id } = request.user;

        logRequest(
          request,
          `Fetching projects for tenant: ${tenant_id.substring(0, 8)}...`
        );

        // Get all projects for this tenant
        const projects = await dbService.getProjects(tenant_id);

        logRequest(request, `Found ${projects.length} projects for tenant`);

        // Add URL to each project
        const projectsWithUrl = projects.map((project) => ({
          ...project,
          url: constructCdnUrl(project.subdomain, tenant_id),
        }));

        logRequest(request, 'Successfully processed projects request');
        return reply.code(200).send(projectsWithUrl);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        fastify.log.error({
          route: request.url,
          method: request.method,
          reqId: request.id,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : 'No stack trace',
        });

        return reply.code(500).send({
          error: 'Internal server error',
          message: errorMessage,
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
      logRequest(request, 'POST project creation request received');

      try {
        // Extract user and tenant from auth middleware
        const { user_id, tenant_id } = request.user;

        logRequest(
          request,
          `Project creation for tenant: ${tenant_id.substring(0, 8)}...`
        );

        // Get project name from request body
        const { name, description } = request.body;

        logRequest(request, `Creating project "${name}" for tenant`);

        if (!name) {
          logRequest(request, 'Project creation failed: name is required');
          return reply.code(400).send({ error: 'Project name is required' });
        }

        // this needs to remove all dashes from the end of the name
        let nameMutated = name;
        while (nameMutated.endsWith('-')) {
          nameMutated = nameMutated.slice(0, -1);
        }
        // needs to be a string with atleast 3 characters
        if (nameMutated.length < 3) {
          logRequest(request, 'Project creation failed: name is too short');
          return reply.code(400).send({
            error: 'Project name is too short. Min 3 characters',
          });
        }

        // Generate subdomain from name
        const subdomain = slugify(name, {
          lower: true,
          strict: true,
        });

        logRequest(request, `Generated subdomain: ${subdomain}`);

        // Check if project with this subdomain already exists
        const existingProject = await dbService.getProjectBySubdomain(
          subdomain
        );

        if (existingProject) {
          logRequest(
            request,
            `Project creation failed: subdomain ${subdomain} already exists`
          );
          return reply.code(400).send({
            error: `Project with subdomain '${subdomain}' already exists`,
          });
        }

        // Create a new project
        logRequest(
          request,
          `Creating project in database with subdomain: ${subdomain}`
        );
        const project = await dbService.createProject({
          tenant_id,
          owner_id: user_id,
          name,
          subdomain,
          description,
        });

        // Add URL to the project
        const projectWithUrl = {
          ...project,
          url: constructCdnUrl(project.subdomain, tenant_id),
        };

        // Return the created project
        logRequest(
          request,
          `Project successfully created with ID: ${project.id.substring(
            0,
            8
          )}...`
        );
        return reply.code(201).send(projectWithUrl);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        fastify.log.error({
          route: request.url,
          method: request.method,
          reqId: request.id,
          body: request.body
            ? JSON.stringify(request.body).substring(0, 100)
            : 'no body',
          error: errorMessage,
          stack: error instanceof Error ? error.stack : 'No stack trace',
        });

        return reply.code(500).send({
          error: 'Internal server error',
          message: errorMessage,
        });
      }
    },
  });
}
