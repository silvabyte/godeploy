import Fastify from 'fastify';
import { autoloadRoutesAndPlugins } from './autoload';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import { Logger } from '../log';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ActionTelemetry } from '../../logging/ActionTelemetry';

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyInstance {
    supabase: SupabaseClient;
    _telemetry: Logger;
    telemetry: Logger;
    _measure: ActionTelemetry;
    measure: ActionTelemetry;
    resetMeasure: () => void;
  }
  interface FastifyRequest {
    _telemetry: Logger;
    telemetry: Logger;
    _measure: ActionTelemetry;
    measure: ActionTelemetry;
    resetMeasure: () => void;
    user: {
      user_id: string;
      tenant_id: string;
    };
  }

  interface FastifyContextConfig {
    auth?: boolean;
  }
}

/**
 * Builds and configures the Fastify application
 * @returns Configured Fastify instance
 */
export async function buildApp() {
  const logger = new Logger();

  // Instantiate Fastify with some config
  const server = Fastify({
    loggerInstance: logger,
  });

  const headerMasked = (
    headers: Record<string, string | string[] | undefined>
  ) => {
    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [
        key,
        key === 'Authorization' ? 'REDACTED' : value,
      ])
    );
  };

  server.decorate('_telemetry');
  server.decorate('telemetry', {
    getter() {
      this._telemetry ??= logger;
      return this._telemetry;
    },
  });

  server.decorate('_measure');
  server.decorate('measure', {
    getter() {
      this._measure ??= new ActionTelemetry(this.telemetry);
      return this._measure;
    },
  });
  server.decorate('resetMeasure', function () {
    this._measure = new ActionTelemetry(this.telemetry);
  });

  server.decorateRequest('_telemetry');
  server.decorateRequest('telemetry', {
    getter() {
      this._telemetry ??= logger;
      return this._telemetry;
    },
  });

  server.decorateRequest('_measure');
  server.decorateRequest('measure', {
    getter() {
      this._measure ??= new ActionTelemetry(this.telemetry);
      return this._measure;
    },
  });
  server.decorateRequest('resetMeasure', function () {
    this._measure = new ActionTelemetry(this.telemetry);
  });

  server.addHook('onRequest', (request, reply, done) => {
    request.measure.start('request', {
      requestId: request.headers['x-request-id'] ?? request.id,
      url: request.url,
      method: request.method,
      headers: headerMasked(request.headers),
      ...(request.user?.user_id && { user_id: request.user.user_id }),
      ...(request.user?.tenant_id && { tenant_id: request.user.tenant_id }),
    });
    done();
  });

  server.addHook('onResponse', (request, reply, done) => {
    const statusCode = reply.statusCode;
    if (statusCode >= 400) {
      request.measure.failure('request', {
        statusCode,
      });
    } else {
      request.measure.success({
        statusCode,
      });
    }
    request.resetMeasure();
    done();
  });

  // Register CORS
  await server.register(cors, {
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

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
      schemes:
        process.env.NODE_ENV === 'production' ? ['https'] : ['http', 'https'],
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
  });

  // Register Swagger UI
  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Register your application as a normal plugin.
  server.register(autoloadRoutesAndPlugins);

  await server.ready();
  server.swagger();

  return server;
}
