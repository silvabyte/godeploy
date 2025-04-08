import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { StorageService } from '../components/storage/StorageService';
import { FileProcessor } from '../components/storage/FileProcessor';
import { v4 as uuidv4 } from 'uuid';
import fastifyMultipart, { type MultipartFile } from '@fastify/multipart';
import { constructCdnUrl } from '../utils/urlUtils';
import {
  routeSchemas,
  type DeployQuerystring,
} from '../components/deploys/deploys.types';
import { validateAndTransformProjectName } from '../components/projects/project-utils';

export default async function (fastify: FastifyInstance) {
  // Register multipart support
  try {
    await fastify.register(fastifyMultipart, {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100mb limit
      },
    });
  } catch (err) {
    fastify.log.error('Failed to register multipart plugin:', err);
    throw err; // This is a startup error, so we should fail fast
  }

  // Initialize services
  const storageService = new StorageService();

  const uploadHandler = async (
    request: FastifyRequest<{
      Querystring: DeployQuerystring;
    }>,
    reply: FastifyReply
  ) => {
    const { user_id, tenant_id } = request.user;
    const deployId = uuidv4().substring(0, 8);
    request.measure.start('deploy', {
      reqId: request.id,
      project: request.query.project,
      deployId,
      userId: user_id,
      tenantId: tenant_id,
    });

    // Get project name from query parameter
    const projectName = request.query.project;
    if (!projectName) {
      request.measure.failure('Project name is required');
      return reply.code(400).send({ error: 'Project name is required' });
    }

    // Parse multipart form
    request.measure.add('parse_multipart');
    let parts: AsyncIterableIterator<MultipartFile>;
    try {
      parts = request.parts() as AsyncIterableIterator<MultipartFile>;
      if (!parts) {
        request.measure.failure('No files uploaded');
        return reply.code(400).send({ error: 'No files uploaded' });
      }
    } catch (err) {
      request.measure.failure('Failed to parse multipart form');
      return reply.code(400).send({
        error: 'Failed to parse multipart form',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    // Process uploaded files
    const fileProcessor = new FileProcessor(request.measure);
    const { archivePath, error: processError } =
      await fileProcessor.processDeployFiles(parts);

    if (processError || !archivePath) {
      request.measure.failure(processError || 'No archive file found');
      return reply
        .code(400)
        .send({ error: processError || 'No archive file found' });
    }

    // Validate archive
    const validateResult = await fileProcessor.validateArchive(archivePath);
    if (validateResult.error || !validateResult.data) {
      request.measure.failure(
        validateResult.error || 'Archive validation failed'
      );
      return reply
        .code(400)
        .send({ error: validateResult.error || 'Archive validation failed' });
    }

    // Get project from database
    request.measure.add('get_project');
    const projectResult = await request.db.projects.getProjectByName(
      projectName,
      tenant_id
    );

    let project;
    if (!projectResult.data) {
      // Project doesn't exist, let's create it
      request.measure.add('validate_project_name');
      const nameResult = validateAndTransformProjectName(projectName);

      if (nameResult.error || !nameResult.data) {
        request.measure.failure(nameResult.error || 'Invalid project name');
        return reply
          .code(400)
          .send({ error: nameResult.error || 'Invalid project name' });
      }

      const { name, subdomain } = nameResult.data;
      request.measure.add('check_subdomain');

      // Check if project with this subdomain already exists
      const existingProjectResult =
        await request.db.projects.getProjectBySubdomain(subdomain);

      if (existingProjectResult.data) {
        request.measure.failure('Project with this name already exists');
        return reply.code(400).send({
          error: 'Project with this name already exists',
        });
      }

      if (existingProjectResult.error) {
        request.measure.failure(existingProjectResult.error);
        return reply.code(500).send({
          error: 'Failed to check project existence',
          message: existingProjectResult.error,
        });
      }

      // Create the project
      request.measure.add('create_project');
      const createResult = await request.db.projects.createProject({
        tenant_id,
        owner_id: user_id,
        name,
        subdomain,
        description: null,
      });

      if (createResult.error || !createResult.data) {
        request.measure.failure(
          createResult.error || 'Failed to create project'
        );
        return reply.code(500).send({
          error: 'Failed to create project',
          message: createResult.error,
        });
      }

      project = createResult.data;
    } else {
      project = projectResult.data;
    }

    // Record the deployment in the database
    request.measure.add('record_deploy');
    const deployResult = await request.db.deploys.recordDeploy({
      tenant_id,
      project_id: project.id,
      user_id,
      url: constructCdnUrl(project.subdomain, tenant_id),
      status: 'pending',
    });

    if (deployResult.error || !deployResult.data) {
      request.measure.failure(
        deployResult.error || 'Failed to record deployment'
      );
      return reply.code(500).send({
        error: 'Failed to record deployment',
        message: deployResult.error,
      });
    }

    const deploy = deployResult.data;

    // Upload files to storage
    request.measure.add('upload_files');
    const uploadResult = await storageService.processSpaArchive(
      archivePath,
      tenant_id,
      project.subdomain
    );

    if (uploadResult.error) {
      request.measure.failure(uploadResult.error);
      // Update deployment status to failed
      if (deploy.id) {
        const updateResult = await request.db.deploys.updateDeployStatus(
          deploy.id,
          'failed'
        );
        if (updateResult.error) {
          request.measure.add('failed_to_update_status');
        }
      }
      return reply.code(500).send({
        error: 'Failed to upload files',
        message: uploadResult.error,
      });
    }

    // Update deployment status to success
    request.measure.add('update_status');
    if (!deploy.id) {
      request.measure.failure('Deploy ID not found');
      return reply.code(500).send({
        error: 'Failed to update deployment status',
        message: 'Deploy ID not found',
      });
    }

    const updateResult = await request.db.deploys.updateDeployStatus(
      deploy.id,
      'success'
    );

    if (updateResult.error) {
      request.measure.failure(updateResult.error);
      return reply.code(500).send({
        error: 'Failed to update deployment status',
        message: updateResult.error,
      });
    }

    request.measure.success();
    return reply.code(200).send(deploy);
  };

  fastify.post('/api/deploys', {
    ...routeSchemas.postDeploy,
    handler: uploadHandler,
  });

  fastify.post('/api/deploy', {
    ...routeSchemas.postDeploy,
    handler: uploadHandler,
  });

  // fastify.get('/api/deploys', {
  //   ...routeSchemas.listDeploys,
  //   handler: async (request: FastifyRequest, reply: FastifyReply) => {
  //     const { project } = request.query;
  //     const deploys = await request.db.deploys.getDeploys(project);
  //   },
  // });

  fastify.get('/api/deploys/:id', {
    ...routeSchemas.getDeploy,
    handler: async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      const { id } = request.params;
      const deploy = await request.db.deploys.getDeployById(id);
      if (deploy.error) {
        return reply.code(500).send({ error: deploy.error });
      }
      return reply.code(200).send(deploy.data);
    },
  });
}
