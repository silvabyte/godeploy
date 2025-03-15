import 'dotenv/config';
import Fastify from 'fastify';
import { app } from './app/app';
import swagger from '@fastify/swagger';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

await server.register(swagger);
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
  }
});
