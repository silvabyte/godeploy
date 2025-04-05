import type { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';

import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = resolve(__dirname, '..');

/* eslint-disable-next-line */
export interface AppOptions {}

export async function autoloadRoutesAndPlugins(
  fastify: FastifyInstance,
  opts: AppOptions
) {
  // Register Supabase Auth middleware

  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: join(srcDir, 'plugins'),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: join(srcDir, 'routes'),
    options: { ...opts },
  });
}
