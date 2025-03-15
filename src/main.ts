import 'dotenv/config';
import Fastify from 'fastify';
import { app } from './app/app';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
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
    host: `${host}:${port}`,
    schemes: ['http', 'https'],
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
  }
});
