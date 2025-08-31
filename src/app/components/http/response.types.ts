import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

// Common error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
})

// Not found response schema
export const notFoundResponseSchema = z.object({
  error: z.string(),
})

// Success response schema
export const successResponseSchema = z.object({
  success: z.boolean(),
})

// Generate JSON schemas
export const errorResponseJsonSchema = zodToJsonSchema(errorResponseSchema)
export const notFoundResponseJsonSchema = zodToJsonSchema(notFoundResponseSchema)
export const successResponseJsonSchema = zodToJsonSchema(successResponseSchema)

// Common response schemas for Fastify
export const commonResponseSchemas = {
  error: {
    type: 'object',
    properties: {
      error: { type: 'string' },
      message: { type: 'string' },
    },
  },
  notFound: {
    type: 'object',
    properties: {
      error: { type: 'string' },
    },
  },
  success: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
}
