import { describe, expect, it } from 'bun:test'
import Fastify from 'fastify'

import sensiblePlugin from '../src/app/plugins/sensible'
import { routeSchemas as deployRouteSchemas } from '../src/app/components/deploys/deploys.types'
import { authErrorResponseJsonSchema, signUpJsonSchema } from '../src/app/components/auth/auth.types'

describe('Global error handler integration', () => {
  it('returns { error, message } for 500 to satisfy deploy 500 schema', async () => {
    const app = Fastify({ logger: false })
    await app.register(sensiblePlugin)

    app.get('/test/error500', {
      schema: {
        response: {
          // Reuse the deploy route 500 schema that requires both fields
          500: deployRouteSchemas.postDeploy.schema.response[500],
        },
      },
      handler: async () => {
        throw new Error('Kaboom')
      },
    })

    const res = await app.inject({ method: 'GET', url: '/test/error500' })
    expect(res.statusCode).toBe(500)

    const body = res.json() as { error: string; message: string }
    expect(typeof body.error).toBe('string')
    expect(typeof body.message).toBe('string')
    expect(body.error).toBe('Internal server error')
    expect(body.message).toBe('Kaboom')
  })

  it('maps validation errors (400) to { success:false, error } for auth schemas', async () => {
    const app = Fastify({ logger: false })
    await app.register(sensiblePlugin)

    app.post('/test/validate-signup', {
      schema: {
        body: signUpJsonSchema,
        response: {
          200: { type: 'null' },
          400: authErrorResponseJsonSchema, // requires success:false and error
        },
      },
      handler: async () => null,
    })

    const res = await app.inject({
      method: 'POST',
      url: '/test/validate-signup',
      payload: { email: 'invalid-email', password: 'short' },
    })

    expect(res.statusCode).toBe(400)
    const body = res.json() as { success: boolean; error: string }
    expect(body.success).toBe(false)
    expect(typeof body.error).toBe('string')
    // ajv default error message for email format
    expect(body.error.toLowerCase()).toContain('format')
  })
})
