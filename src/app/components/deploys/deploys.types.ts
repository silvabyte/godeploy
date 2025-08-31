import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Base deploy schema
const DeploySchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  project_id: z.string(),
  user_id: z.string(),
  url: z.string(),
  status: z.enum(['pending', 'success', 'failed']),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

// Request schemas
const DeployQuerystringSchema = z.object({
  project: z.string(),
})

//TODO: have better generic filter query params
//?filter[project]=projectId&sort[created_at]=desc&limit=10&offset=0
const _DeployFilterKeys = ['project']
const _DeploySortKeys = ['created_at']

const _FilterSchema = z.object({
  project: z.string().optional(),
})

const _SortSchema = z.object({
  created_at: z.string().optional(),
})

const DeployListQuerystringSchema = z.object({
  project: z.string().optional(), //TODO: make this another filter param, so filter[project]=projectId
  limit: z.number().optional(), //limit=10
  offset: z.number().optional(), //offset=0 //needs to support an id for the offset, which can be returned in the response
})

// Response schemas
const DeployResponseSchema = DeploySchema
const DeployListResponseSchema = z.object({
  deploys: z.array(DeploySchema),
  total: z.number(),
})
const ErrorResponseSchema = z.object({
  error: z.string(),
})

const ErrorWithMessageResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
})

// Route schemas
export const routeSchemas = {
  listDeploys: {
    schema: {
      security: [{ bearerAuth: [] }],
      querystring: zodToJsonSchema(DeployListQuerystringSchema),
      response: {
        200: zodToJsonSchema(DeployListResponseSchema),
        400: zodToJsonSchema(ErrorResponseSchema),
        404: zodToJsonSchema(ErrorResponseSchema),
        500: zodToJsonSchema(ErrorWithMessageResponseSchema),
      },
    },
  },
  getDeploy: {
    schema: {
      security: [{ bearerAuth: [] }],
      response: {
        200: zodToJsonSchema(DeployResponseSchema),
        400: zodToJsonSchema(ErrorResponseSchema),
        404: zodToJsonSchema(ErrorResponseSchema),
        500: zodToJsonSchema(ErrorWithMessageResponseSchema),
      },
    },
  },
  postDeploy: {
    schema: {
      security: [{ bearerAuth: [] }],
      querystring: zodToJsonSchema(DeployQuerystringSchema),
      response: {
        200: zodToJsonSchema(DeployResponseSchema),
        400: zodToJsonSchema(ErrorResponseSchema),
        404: zodToJsonSchema(ErrorResponseSchema),
        500: zodToJsonSchema(ErrorWithMessageResponseSchema),
      },
    },
  },
}

// Type exports
export type Deploy = z.infer<typeof DeploySchema>
export type DeployQuerystring = z.infer<typeof DeployQuerystringSchema>
