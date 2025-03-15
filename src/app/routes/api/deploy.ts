import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { StorageService } from '../../services/storageService';
import { DbService } from '../../services/dbService';
import { FileUtils } from '../../utils/fileUtils';
import { v4 as uuidv4 } from 'uuid';
import fastifyMultipart from '@fastify/multipart';

// Define the request interface with proper typing
interface DeployQuerystring {
  project: string;
}

// Define the schema for the deploy endpoint
const deploySchema = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        project: { type: 'string' },
      },
      required: ['project'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          url: { type: 'string' },
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
  // Register multipart support
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
  });

  // Initialize services
  const storageService = new StorageService();
  const dbService = new DbService();

  fastify.post('/api/deploy', {
    ...deploySchema,
    handler: async (
      request: FastifyRequest<{
        Querystring: DeployQuerystring;
      }>,
      reply: FastifyReply
    ) => {
      try {
        // Extract user and tenant from auth middleware
        const { user_id, tenant_id } = request.user;

        // Parse multipart form
        const parts = request.parts();

        if (!parts) {
          return reply.code(400).send({ error: 'No files uploaded' });
        }

        // Get project name from query parameter
        const projectName = request.query.project;

        if (!projectName) {
          return reply.code(400).send({ error: 'Project name is required' });
        }

        // Validate files
        let archivePath: string | null = null;
        let configPath: string | null = null;

        // Process the uploaded files
        for await (const part of parts) {
          if (part.type === 'file') {
            const buffer = await part.toBuffer();

            if (part.fieldname === 'archive') {
              archivePath = await FileUtils.saveBufferToTemp(
                buffer,
                'archive.zip'
              );
            } else if (part.fieldname === 'spa_config') {
              configPath = await FileUtils.saveBufferToTemp(
                buffer,
                'spa-config.json'
              );
            }
          }
        }

        // Check if we have both required files
        if (!archivePath) {
          return reply.code(400).send({ error: 'Archive file is required' });
        }

        // Validate the SPA archive
        const isValidArchive = await FileUtils.validateSpaArchive(archivePath);
        if (!isValidArchive) {
          return reply
            .code(400)
            .send({ error: 'Invalid SPA archive structure' });
        }

        // Check if project exists or create a new one
        let project = await dbService.getProjectByName(projectName, tenant_id);

        if (!project) {
          // Create a new project
          project = await dbService.createProject({
            tenant_id,
            owner_id: user_id,
            name: projectName,
            subdomain: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          });
        }

        // Create a deploy record with pending status
        const deploy = await dbService.recordDeploy({
          tenant_id,
          project_id: project.id,
          user_id,
          url: `https://${project.subdomain}.godeploy.app`,
          status: 'pending',
        });

        try {
          // Upload files to DigitalOcean Spaces
          const cdnUrl = await storageService.processSpaArchive(
            archivePath,
            tenant_id,
            project.id,
            project.subdomain
          );

          // Update deploy status to success
          await dbService.updateDeployStatus(deploy.id!, 'success');

          // Return success response
          return reply.code(200).send({
            success: true,
            url: cdnUrl,
          });
        } catch (error) {
          // Update deploy status to failed
          await dbService.updateDeployStatus(deploy.id!, 'failed');
          throw error;
        } finally {
          // Clean up temporary files
          if (archivePath) {
            await FileUtils.cleanupTempFile(archivePath);
          }
          if (configPath) {
            await FileUtils.cleanupTempFile(configPath);
          }
        }
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
