import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { addUrlToProject, validateAndTransformProjectName } from '../components/projects/project-utils'
import {
  type CreateProjectBody,
  type UpdateProjectDomainBody,
  routeSchemas,
} from '../components/projects/projects.types'
import { DomainValidator } from '../utils/domain-validator'

export default async function (fastify: FastifyInstance) {
  // Get all projects for the authenticated tenant
  fastify.get('/api/projects', {
    ...routeSchemas.getProjects,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { tenant_id } = request.user
      request.measure.start('get_projects', {
        reqId: request.id,
        userId: request.user.user_id,
        tenantId: tenant_id,
      })

      // Get all projects for this tenant
      request.measure.add('fetch_projects')
      const projectsResult = await request.db.projects.getProjects(tenant_id)

      if (projectsResult.error || !projectsResult.data) {
        request.measure.failure(projectsResult.error || 'Failed to fetch projects')
        return reply.code(500).send({
          error: 'Failed to fetch projects',
          message: projectsResult.error,
        })
      }

      // Add URL to each project
      const projectsWithUrl = addUrlToProject(projectsResult.data)

      request.measure.success()
      return reply.code(200).send(projectsWithUrl)
    },
  })

  // Create a new project
  fastify.post('/api/projects', {
    ...routeSchemas.createProject,
    handler: async (
      request: FastifyRequest<{
        Body: CreateProjectBody
      }>,
      reply: FastifyReply,
    ) => {
      const { user_id, tenant_id } = request.user
      request.measure.start('create_project', {
        reqId: request.id,
        userId: user_id,
        tenantId: tenant_id,
        projectName: request.body.name,
      })

      // Validate and transform project name
      request.measure.add('validate_project_name')
      const nameResult = validateAndTransformProjectName(request.body.name)

      if (nameResult.error) {
        request.measure.failure(nameResult.error)
        return reply.code(400).send({ error: nameResult.error })
      }

      const { name, subdomain } = nameResult.data!
      request.measure.add('check_subdomain', { subdomain })

      // Check if project with this subdomain already exists
      const existingProjectResult = await request.db.projects.getProjectBySubdomain(subdomain)

      if (existingProjectResult.data) {
        request.measure.failure('Project with this name already exists')
        return reply.code(400).send({
          error: 'Project with this name already exists',
        })
      }

      if (existingProjectResult.error) {
        request.measure.failure(existingProjectResult.error)
        return reply.code(500).send({
          error: 'Failed to check project existence',
          message: existingProjectResult.error,
        })
      }

      // Create the project
      request.measure.add('create_project')
      const projectResult = await request.db.projects.createProject({
        tenant_id,
        owner_id: user_id,
        name,
        subdomain,
        description: request.body.description ?? null,
      })

      if (projectResult.error || !projectResult.data) {
        request.measure.failure(projectResult.error || 'Failed to create project')
        return reply.code(500).send({
          error: 'Failed to create project',
          message: projectResult.error,
        })
      }

      // Add URL to project
      const projectWithUrl = addUrlToProject(projectResult.data)

      request.measure.success()
      return reply.code(201).send(projectWithUrl)
    },
  })

  // Update project domain
  fastify.patch('/api/projects/:projectId/domain', {
    ...routeSchemas.updateProjectDomain,
    handler: async (
      request: FastifyRequest<{
        Params: { projectId: string }
        Body: UpdateProjectDomainBody
      }>,
      reply: FastifyReply,
    ) => {
      const { tenant_id } = request.user
      const { projectId } = request.params
      const { domain } = request.body

      request.measure.start('update_project_domain', {
        reqId: request.id,
        userId: request.user.user_id,
        tenantId: tenant_id,
        projectId,
      })

      // Check if project exists and belongs to tenant
      request.measure.add('check_project')
      const projectResult = await request.db.projects.getProjectById(projectId)

      if (projectResult.error || !projectResult.data) {
        request.measure.failure('Project not found')
        return reply.code(404).send({
          error: 'Project not found',
          message: 'The specified project does not exist',
        })
      }

      if (projectResult.data.tenant_id !== tenant_id) {
        request.measure.failure('Unauthorized')
        return reply.code(403).send({
          error: 'Unauthorized',
          message: 'You do not have permission to update this project',
        })
      }

      // If domain is provided, validate format and availability
      if (domain) {
        // Validate domain format
        if (!DomainValidator.isValidDomainFormat(domain)) {
          request.measure.failure('Invalid domain format')
          return reply.code(400).send({
            error: 'Invalid domain format',
            message: 'The provided domain is not in a valid format',
          })
        }

        // Check if domain is already in use by another project
        request.measure.add('check_domain_availability')
        const availabilityResult = await request.db.projects.isDomainAvailable(domain, projectId)

        if (availabilityResult.error) {
          request.measure.failure(availabilityResult.error)
          return reply.code(500).send({
            error: 'Failed to check domain availability',
            message: availabilityResult.error,
          })
        }

        if (!availabilityResult.data) {
          request.measure.failure('Domain already in use')
          return reply.code(409).send({
            error: 'Domain already in use',
            message: 'This domain is already assigned to another project',
          })
        }

        // Validate CNAME configuration
        request.measure.add('validate_cname')
        const validationResult = await DomainValidator.validateCnameConfiguration(domain)

        if (validationResult.error) {
          request.measure.failure(validationResult.error)
          return reply.code(500).send({
            error: 'Failed to validate domain',
            message: validationResult.error,
          })
        }

        if (!validationResult.data?.isValid) {
          request.measure.failure('Invalid CNAME configuration')
          return reply.code(400).send({
            error: 'Invalid CNAME configuration',
            message: validationResult.data?.error || 'Domain CNAME is not properly configured',
          })
        }
      }

      // Update the project domain
      request.measure.add('update_domain')
      const updateResult = await request.db.projects.updateProjectDomain(projectId, domain)

      if (updateResult.error || !updateResult.data) {
        request.measure.failure(updateResult.error || 'Failed to update domain')
        return reply.code(500).send({
          error: 'Failed to update domain',
          message: updateResult.error,
        })
      }

      // Add URL to project
      const projectWithUrl = addUrlToProject(updateResult.data)

      request.measure.success()
      return reply.code(200).send(projectWithUrl)
    },
  })
}
