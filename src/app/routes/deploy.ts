import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { StorageService } from '../services/storageService';
import { DbService } from '../services/dbService';
import { FileUtils } from '../utils/fileUtils';
import { v4 as uuidv4 } from 'uuid';
import fastifyMultipart from '@fastify/multipart';

// Define the request interface with proper typing
interface DeployQuerystring {
  project: string;
}

// Define the schema for the deploy endpoint
const deploySchema = {
  schema: {
    security: [{ bearerAuth: [] }],
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
      404: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
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
      fileSize: 100 * 1024 * 1024, // 100mb limit
    },
  });

  // Initialize services
  const storageService = new StorageService();
  const dbService = new DbService();

  // Logger utility function
  const logRequest = (
    request: FastifyRequest,
    message: string,
    extraData = {}
  ) => {
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
      ...extraData,
    });
  };

  fastify.post('/api/deploy', {
    ...deploySchema,
    handler: async (
      request: FastifyRequest<{
        Querystring: DeployQuerystring;
      }>,
      reply: FastifyReply
    ) => {
      const deployId = uuidv4().substring(0, 8);
      logRequest(request, `[Deploy:${deployId}] Deployment request received`, {
        project: request.query.project,
      });

      try {
        // Extract user and tenant from auth middleware
        const { user_id, tenant_id } = request.user;

        logRequest(
          request,
          `[Deploy:${deployId}] Processing deployment for tenant: ${tenant_id.substring(
            0,
            8
          )}...`
        );

        // Parse multipart form
        const parts = request.parts();

        if (!parts) {
          logRequest(
            request,
            `[Deploy:${deployId}] Deployment failed: No files uploaded`
          );
          return reply.code(400).send({ error: 'No files uploaded' });
        }

        // Get project name from query parameter
        const projectName = request.query.project;

        if (!projectName) {
          logRequest(
            request,
            `[Deploy:${deployId}] Deployment failed: Project name is required`
          );
          return reply.code(400).send({ error: 'Project name is required' });
        }

        logRequest(
          request,
          `[Deploy:${deployId}] Deploying to project: ${projectName}`
        );

        // Validate files
        let archivePath: string | null = null;
        let configPath: string | null = null;

        // Process the uploaded files
        logRequest(request, `[Deploy:${deployId}] Processing uploaded files`);
        for await (const part of parts) {
          if (part.type === 'file') {
            const buffer = await part.toBuffer();
            logRequest(
              request,
              `[Deploy:${deployId}] Processing file: ${part.fieldname}, size: ${buffer.length} bytes`
            );

            if (part.fieldname === 'archive') {
              archivePath = await FileUtils.saveBufferToTemp(
                buffer,
                'archive.zip'
              );
              logRequest(
                request,
                `[Deploy:${deployId}] Archive saved to: ${archivePath}`
              );
            } else if (part.fieldname === 'spa_config') {
              configPath = await FileUtils.saveBufferToTemp(
                buffer,
                'spa-config.json'
              );
              logRequest(
                request,
                `[Deploy:${deployId}] Config saved to: ${configPath}`
              );
            }
          }
        }

        // Check if we have both required files
        if (!archivePath) {
          logRequest(
            request,
            `[Deploy:${deployId}] Deployment failed: Archive file is required`
          );
          return reply.code(400).send({ error: 'Archive file is required' });
        }

        // Validate the SPA archive
        logRequest(request, `[Deploy:${deployId}] Validating SPA archive`);
        const isValidArchive = await FileUtils.validateSpaArchive(archivePath);
        if (!isValidArchive) {
          logRequest(
            request,
            `[Deploy:${deployId}] Deployment failed: Invalid SPA archive structure`
          );
          return reply
            .code(400)
            .send({ error: 'Invalid SPA archive structure' });
        }

        logRequest(
          request,
          `[Deploy:${deployId}] SPA archive validation successful`
        );

        // Check if project exists
        logRequest(
          request,
          `[Deploy:${deployId}] Checking if project exists: ${projectName}`
        );
        const project = await dbService.getProjectByName(
          projectName,
          tenant_id
        );

        if (!project) {
          // Return 404 error if project doesn't exist
          logRequest(
            request,
            `[Deploy:${deployId}] Project not found: ${projectName}`
          );
          return reply.code(404).send({
            error: `Project '${projectName}' not found`,
            message: `Please initialize a new project first with: godeploy project create --name ${projectName}`,
          });
        }

        logRequest(
          request,
          `[Deploy:${deployId}] Project found: ${projectName}, ID: ${project.id.substring(
            0,
            8
          )}...`
        );

        // Create a deploy record with pending status
        logRequest(
          request,
          `[Deploy:${deployId}] Creating deploy record with status: pending`
        );
        const deploy = await dbService.recordDeploy({
          tenant_id,
          project_id: project.id,
          user_id,
          url: `https://${project.subdomain}.spa.godeploy.app`,
          status: 'pending',
        });

        logRequest(
          request,
          `[Deploy:${deployId}] Deploy record created with ID: ${deploy.id!.substring(
            0,
            8
          )}...`
        );

        try {
          // Upload files to DigitalOcean Spaces
          logRequest(
            request,
            `[Deploy:${deployId}] Starting upload to DigitalOcean Spaces`
          );
          const cdnUrl = await storageService.processSpaArchive(
            archivePath,
            tenant_id,
            project.id,
            project.subdomain
          );

          logRequest(
            request,
            `[Deploy:${deployId}] Upload complete, CDN URL: ${cdnUrl}`
          );

          // Update deploy status to success
          logRequest(
            request,
            `[Deploy:${deployId}] Updating deploy status to: success`
          );
          await dbService.updateDeployStatus(deploy.id!, 'success');

          // Return success response
          logRequest(request, `[Deploy:${deployId}] Deployment successful`);
          return reply.code(200).send({
            success: true,
            url: cdnUrl,
          });
        } catch (error) {
          // Update deploy status to failed
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          fastify.log.error({
            route: request.url,
            method: request.method,
            reqId: request.id,
            deployId,
            error: errorMessage,
            stack: error instanceof Error ? error.stack : 'No stack trace',
          });

          logRequest(
            request,
            `[Deploy:${deployId}] Updating deploy status to: failed due to: ${errorMessage}`
          );
          await dbService.updateDeployStatus(deploy.id!, 'failed');
          throw error;
        } finally {
          // Clean up temporary files
          logRequest(
            request,
            `[Deploy:${deployId}] Cleaning up temporary files`
          );
          if (archivePath) {
            await FileUtils.cleanupTempFile(archivePath);
          }
          if (configPath) {
            await FileUtils.cleanupTempFile(configPath);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        fastify.log.error({
          route: request.url,
          method: request.method,
          reqId: request.id,
          deployId,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : 'No stack trace',
          query: request.query ? JSON.stringify(request.query) : 'no query',
        });

        return reply.code(500).send({
          error: 'Internal server error',
          message: errorMessage,
        });
      }
    },
  });
}
