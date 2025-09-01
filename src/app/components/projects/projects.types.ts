import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { commonResponseSchemas } from '../http/response.types'

// Base project schema
const projectSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  owner_id: z.string(),
  name: z.string(),
  subdomain: z.string(),
  description: z.string().nullable(),
  domain: z.string({ description: 'Custom domain for the given project' }).nullable().optional(), // if this is prov
  url: z
    .string({
      description: 'Final project url, computed from the domain if it exists and falls back to using the subdomain',
    })
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Request schemas
export const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
})

export const updateProjectDomainSchema = z.object({
  domain: z.string().nullable().describe('Custom domain for the project (null to remove)'),
})

// Response schemas
export const projectsResponseSchema = z.array(projectSchema)

// Generate JSON schemas
export const projectJsonSchema = zodToJsonSchema(projectSchema)
export const projectsJsonSchema = zodToJsonSchema(projectsResponseSchema)
export const createProjectJsonSchema = zodToJsonSchema(createProjectSchema)
export const updateProjectDomainJsonSchema = zodToJsonSchema(updateProjectDomainSchema)

// Route schemas
export const routeSchemas = {
  getProjects: {
    schema: {
      security: [{ bearerAuth: [] }],
      response: {
        200: projectsJsonSchema,
        500: commonResponseSchemas.error,
      },
    },
  },
  createProject: {
    schema: {
      security: [{ bearerAuth: [] }],
      body: createProjectJsonSchema,
      response: {
        201: projectJsonSchema,
        400: commonResponseSchemas.error,
        500: commonResponseSchemas.error,
      },
    },
  },
  updateProjectDomain: {
    schema: {
      security: [{ bearerAuth: [] }],
      params: zodToJsonSchema(z.object({ projectId: z.string() })),
      body: updateProjectDomainJsonSchema,
      response: {
        200: projectJsonSchema,
        400: commonResponseSchemas.error,
        404: commonResponseSchemas.error,
        409: commonResponseSchemas.error,
        500: commonResponseSchemas.error,
      },
    },
  },
}

// Type exports
export type Project = z.infer<typeof projectSchema>
export type CreateProjectBody = z.infer<typeof createProjectSchema>
export type UpdateProjectDomainBody = z.infer<typeof updateProjectDomainSchema>
