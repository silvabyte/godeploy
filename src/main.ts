import 'dotenv/config';
import Fastify from 'fastify';
import { app } from './app/app';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import { Logger } from './app/log';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ActionTelemetry } from './logging/ActionTelemetry';
// Set NODE_ENV to development if not already set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 38444;
const telemetryKey = process.env.TELEMETRY_KEY;

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

const logger = new Logger(telemetryKey as string);

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
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
    url: request.url,
    method: request.method,
    headers: headerMasked(request.headers),
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
      description: 'API for deploying static SPAs to DigitalOcean Spaces + CDN',
      version: '1.0.0',
    },
    externalDocs: {
      url: 'https://godeploy.app',
      description: 'Find more info here',
    },
    host: process.env.APP_URL,
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
server.register(app);

await server.ready();
server.swagger();

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    console.log(`[ ready ] http://${host}:${port}`);
    console.log(`[ docs  ] http://${host}:${port}/documentation`);
    console.log(`[ mode  ] ${process.env.NODE_ENV}`);
  }
});
