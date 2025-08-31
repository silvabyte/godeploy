import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { addUrlToProject, validateAndTransformProjectName } from '../components/projects/project-utils'
import { type CreateProjectBody, routeSchemas } from '../components/projects/projects.types'

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
}
