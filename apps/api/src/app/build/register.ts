import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { FastifyInstance } from "fastify";
import type { Logger } from "../log.js";
import dbPlugin from "../plugins/db.js";
import rateLimitPlugin from "../plugins/ratelimit.js";
// Import plugins in correct dependency order
import sensiblePlugin from "../plugins/sensible.js";
import supabaseAuthPlugin from "../plugins/supabaseAuth.js";
import analyticsRoutes from "../routes/analytics.js";
import authRoutes from "../routes/auth.js";
import buildsRoutes from "../routes/builds.js";
import cacheRoutes from "../routes/cache.js";
import deploysRoutes from "../routes/deploys.js";
import domainsRoutes from "../routes/domains.js";
import envRoutes from "../routes/env.js";
import healthRoutes from "../routes/health.js";
import metricsPagesRoutes from "../routes/metrics.pages.js";
import projectsRoutes from "../routes/projects.js";
import publicMetricsRoutes from "../routes/public.metrics.js";
// Import routes
import rootRoutes from "../routes/root.js";
import subscriptionsRoutes from "../routes/subscriptions.js";
import teamsRoutes from "../routes/teams.js";
import tokensRoutes from "../routes/tokens.js";

export type AppOptions = Record<string, never>;

export async function registerPluginsAndRoutes(
	fastify: FastifyInstance<Server, IncomingMessage, ServerResponse, Logger>,
	opts: AppOptions,
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
	await fastify.register(domainsRoutes, opts);
	await fastify.register(metricsPagesRoutes, opts);
	await fastify.register(publicMetricsRoutes, opts);
	await fastify.register(subscriptionsRoutes, opts);

	// Register new stub routes
	await fastify.register(envRoutes, opts);
	await fastify.register(teamsRoutes, opts);
	await fastify.register(tokensRoutes, opts);
	await fastify.register(cacheRoutes, opts);
	await fastify.register(analyticsRoutes, opts);
	await fastify.register(buildsRoutes, opts);
}
