import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { SupabaseClient } from '@supabase/supabase-js'
import Fastify from 'fastify'
import { ActionTelemetry } from '../../logging/ActionTelemetry.js'
import { Logger } from '../log.js'
import { registerPluginsAndRoutes } from './register.js'

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient
    /* biome-ignore lint/style/useNamingConvention: allow underscored private decorator name */
    _telemetry: Logger
    telemetry: Logger
    /* biome-ignore lint/style/useNamingConvention: allow underscored private decorator name */
    _measure: ActionTelemetry
    measure: ActionTelemetry
    resetMeasure: () => void
  }
  interface FastifyRequest {
    /* biome-ignore lint/style/useNamingConvention: allow underscored private decorator name */
    _telemetry: Logger
    telemetry: Logger
    /* biome-ignore lint/style/useNamingConvention: allow underscored private decorator name */
    _measure: ActionTelemetry
    measure: ActionTelemetry
    resetMeasure: () => void
    user: {
      user_id: string
      tenant_id: string
    }
  }

  interface FastifyContextConfig {
    auth?: boolean
  }
}

/**
 * Builds and configures the Fastify application
 * @returns Configured Fastify instance
 */
export async function buildApp() {
  const logger = new Logger()

  // Instantiate Fastify with some config
  const server = Fastify({
    loggerInstance: logger,
  })

  const headerMasked = (headers: Record<string, string | string[] | undefined>) => {
    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, key === 'Authorization' ? 'REDACTED' : value]),
    )
  }

  server.decorate('_telemetry')
  server.decorate('telemetry', {
    getter() {
      this._telemetry ??= logger
      return this._telemetry
    },
  })

  server.decorate('_measure')
  server.decorate('measure', {
    getter() {
      this._measure ??= new ActionTelemetry(this.telemetry)
      return this._measure
    },
  })
  server.decorate('resetMeasure', function () {
    this._measure = new ActionTelemetry(this.telemetry)
  })

  server.decorateRequest('_telemetry')
  server.decorateRequest('telemetry', {
    getter() {
      this._telemetry ??= logger
      return this._telemetry
    },
  })

  server.decorateRequest('_measure')
  server.decorateRequest('measure', {
    getter() {
      this._measure ??= new ActionTelemetry(this.telemetry)
      return this._measure
    },
  })
  server.decorateRequest('resetMeasure', function () {
    this._measure = new ActionTelemetry(this.telemetry)
  })

  server.addHook('onRequest', (request, _reply, done) => {
    request.measure.start('request', {
      requestId: request.headers['x-request-id'] ?? request.id,
      url: request.url,
      method: request.method,
      headers: headerMasked(request.headers),
      ...(request.user?.user_id && { user_id: request.user.user_id }),
      ...(request.user?.tenant_id && { tenant_id: request.user.tenant_id }),
    })
    done()
  })

  server.addHook('onResponse', (request, reply, done) => {
    const statusCode = reply.statusCode
    if (statusCode >= 400) {
      request.measure.failure('request', {
        statusCode,
      })
    } else {
      request.measure.success({
        statusCode,
      })
    }
    request.resetMeasure()
    done()
  })

  // Register CORS
  const isProd = process.env.NODE_ENV === 'production'
  const godeployOriginRegex = /^https?:\/\/(?:[a-z0-9-]+\.)*godeploy\.app(?::\d+)?$/i
  await server.register(cors, {
    origin: (origin, cb) => {
      // Allow same-origin/non-browser or undefined Origin
      if (!origin) return cb(null, true)
      // Allow everything in non-production
      if (!isProd) return cb(null, true)
      // In production, allow any *.godeploy.app (including apex)
      if (godeployOriginRegex.test(origin)) return cb(null, true)
      // Otherwise, disallow
      cb(null, false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // Allow W3C trace context and common auth/content headers
    allowedHeaders: ['Content-Type', 'Authorization', 'traceparent', 'tracestate'],
    credentials: true,
  })

  // Register Swagger
  await server.register(swagger, {
    swagger: {
      info: {
        title: 'GoDeploy API',
        description: 'API for godeploy.app',
        version: '1.0.0',
      },
      externalDocs: {
        url: 'https://godeploy.app',
        description: 'Find more info here',
      },
      host: new URL(process.env.APP_URL ?? 'https://api.godeploy.app').host,
      schemes: process.env.NODE_ENV === 'production' ? ['https'] : ['http', 'https'],
      consumes: ['application/json', 'multipart/form-data'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  })

  // Register Swagger UI
  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  })

  // Register plugins and routes explicitly
  await registerPluginsAndRoutes(server, {})

  await server.ready()
  server.swagger()

  return server
}
