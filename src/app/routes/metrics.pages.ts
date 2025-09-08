import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import {
  createMetricsPageJson,
  type CreateMetricsPageBody,
  updateMetricsPageJson,
  type UpdateMetricsPageBody,
} from '../components/metrics/metricsPages.types'

const idParams = z.object({ id: z.string() })

const pageResponse = z.object({
  id: z.string(),
  tenant_id: z.string(),
  owner_id: z.string(),
  slug: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  project_ids: z.array(z.string()),
  is_public: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

const listResponse = z.array(pageResponse)

function genSlug(base?: string) {
  const random = Math.random().toString(36).slice(2, 8)
  const fromTitle = base
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return fromTitle && fromTitle.length >= 3 ? `${fromTitle}-${random}` : `metrics-${random}`
}

export default async function (fastify: FastifyInstance) {
  // Create page
  fastify.post('/api/metrics/pages', {
    schema: {
      security: [{ bearerAuth: [] }],
      body: createMetricsPageJson,
      response: { 201: zodToJsonSchema(pageResponse), 400: zodToJsonSchema(z.object({ error: z.string() })) },
    },
    handler: async (request: FastifyRequest<{ Body: CreateMetricsPageBody }>, reply: FastifyReply) => {
      const { tenant_id, user_id } = request.user
      const { slug, title, description, projectIds, isPublic } = request.body

      const finalSlug = slug && slug.length >= 3 ? slug : genSlug(title)

      // Ensure slug is unique
      const existing = await request.db.metricsPages.getBySlug(finalSlug)
      if (existing.data) {
        return reply.code(400).send({ error: 'Slug already in use' })
      }

      const result = await request.db.metricsPages.createPage({
        tenant_id,
        owner_id: user_id,
        slug: finalSlug,
        title: title ?? null,
        description: description ?? null,
        project_ids: projectIds,
        is_public: isPublic ?? true,
      })

      if (result.error || !result.data) {
        return reply.code(500).send({ error: result.error || 'Failed to create page' })
      }

      return reply.code(201).send(result.data)
    },
  })

  // Update page
  fastify.patch('/api/metrics/pages/:id', {
    schema: {
      security: [{ bearerAuth: [] }],
      params: zodToJsonSchema(idParams),
      body: updateMetricsPageJson,
      response: { 200: zodToJsonSchema(pageResponse), 404: zodToJsonSchema(z.object({ error: z.string() })) },
    },
    handler: async (
      request: FastifyRequest<{ Params: { id: string }; Body: UpdateMetricsPageBody }>,
      reply: FastifyReply,
    ) => {
      const { id } = request.params
      const { tenant_id } = request.user
      const svc = request.db.metricsPages
      const byId = await svc.getByIdPublic(id)
      if (byId.error || !byId.data) return reply.code(404).send({ error: 'Not found' })
      if (byId.data.tenant_id !== tenant_id) return reply.code(403).send({ error: 'Unauthorized' })

      const newSlug = request.body.slug
      if (newSlug && newSlug !== byId.data.slug) {
        const exists = await svc.getBySlug(newSlug)
        if (exists.data) return reply.code(400).send({ error: 'Slug already in use' })
      }

      const updated = await svc.updatePage(id, {
        slug: newSlug ?? byId.data.slug,
        title: request.body.title ?? byId.data.title,
        description: request.body.description ?? byId.data.description,
        project_ids: request.body.projectIds ?? byId.data.project_ids,
        is_public: request.body.isPublic ?? byId.data.is_public,
      })
      if (updated.error || !updated.data) return reply.code(500).send({ error: updated.error || 'Update failed' })
      return reply.code(200).send(updated.data)
    },
  })

  // List pages
  fastify.get('/api/metrics/pages', {
    schema: { security: [{ bearerAuth: [] }], response: { 200: zodToJsonSchema(listResponse) } },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const { tenant_id } = request.user
      const result = await request.db.metricsPages.listPages(tenant_id)
      if (result.error || !result.data) return reply.code(500).send([])
      return reply.code(200).send(result.data)
    },
  })

  // Delete page
  fastify.delete('/api/metrics/pages/:id', {
    schema: { security: [{ bearerAuth: [] }], params: zodToJsonSchema(idParams), response: { 204: { type: 'null' } } },
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params
      const { tenant_id } = request.user
      const svc = request.db.metricsPages
      const byId = await svc.getByIdPublic(id)
      if (byId.error || !byId.data) return reply.code(404).send()
      if (byId.data.tenant_id !== tenant_id) return reply.code(403).send()
      const del = await svc.deletePage(id)
      if (del.error) return reply.code(500).send()
      return reply.code(204).send()
    },
  })
}
