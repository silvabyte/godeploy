import type { FastifyInstance } from 'fastify';
import type { Logger } from '../log.js';

// Import plugins in correct dependency order
import sensiblePlugin from '../plugins/sensible.js';
import supabaseAuthPlugin from '../plugins/supabaseAuth.js';
import dbPlugin from '../plugins/db.js';
import rateLimitPlugin from '../plugins/ratelimit.js';

// Import routes
import rootRoutes from '../routes/root.js';
import healthRoutes from '../routes/health.js';
import authRoutes from '../routes/auth.js';
import projectsRoutes from '../routes/projects.js';
import deploysRoutes from '../routes/deploys.js';
import subscriptionsRoutes from '../routes/subscriptions.js';

export interface AppOptions {}

export async function registerPluginsAndRoutes(
  fastify: FastifyInstance<any, any, any, Logger>,
  opts: AppOptions
) {
  // Register plugins in dependency order
  // 1. Sensible must be first (error handling)
  await fastify.register(sensiblePlugin, opts);

  // 2. Supabase auth (creates fastify.supabase decorator)
  await fastify.register(supabaseAuthPlugin, opts);

  // 3. DB plugin (depends on fastify.supabase)
  await fastify.register(dbPlugin, opts);

  // 4. Rate limiting
  await fastify.register(rateLimitPlugin, opts);

  // Register routes
  await fastify.register(rootRoutes, opts);
  await fastify.register(healthRoutes, opts);
  await fastify.register(authRoutes, opts);
  await fastify.register(projectsRoutes, opts);
  await fastify.register(deploysRoutes, opts);
  await fastify.register(subscriptionsRoutes, opts);
}
