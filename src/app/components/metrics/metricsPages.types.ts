import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

export const metricsPageSchema = z.object({
  id: z.string().optional(),
  tenant_id: z.string(),
  owner_id: z.string(),
  slug: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  project_ids: z.array(z.string()),
  is_public: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type MetricsPage = z.infer<typeof metricsPageSchema>

export const createMetricsPageSchema = z.object({
  slug: z.string().min(3).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  projectIds: z.array(z.string()).min(1),
  isPublic: z.boolean().optional(),
})
export type CreateMetricsPageBody = z.infer<typeof createMetricsPageSchema>

export const updateMetricsPageSchema = z.object({
  slug: z.string().min(3).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  projectIds: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
})
export type UpdateMetricsPageBody = z.infer<typeof updateMetricsPageSchema>

export const createMetricsPageJson = zodToJsonSchema(createMetricsPageSchema)
export const updateMetricsPageJson = zodToJsonSchema(updateMetricsPageSchema)
