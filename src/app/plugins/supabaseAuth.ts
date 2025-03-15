import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import fp from 'fastify-plugin';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_API_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default fp(async (fastify) => {
  fastify.decorate('supabase', supabase);

  // Log auth related messages with consistent format
  const logAuth = (
    request: FastifyRequest,
    message: string,
    extraData = {}
  ) => {
    const authHeader = request.headers.authorization || 'none';
    const maskedAuth =
      authHeader !== 'none'
        ? `${authHeader.split(' ')[0]} ${authHeader
            .split(' ')[1]
            ?.substring(0, 10)}...`
        : 'none';

    fastify.log.info({
      auth: true,
      route: request.url,
      method: request.method,
      reqId: request.id,
      authHeader: maskedAuth,
      message,
      ...extraData,
    });
  };

  fastify.addHook(
    'preHandler',
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip auth for routes that don't need it
      if (request.routeOptions.config?.auth === false) {
        logAuth(request, 'Auth skipped for route with auth:false config');
        return;
      }

      logAuth(request, 'Authenticating request');

      try {
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
          logAuth(request, 'Authentication failed: Missing token');
          return reply.code(401).send({ error: 'Unauthorized: Missing token' });
        }

        logAuth(request, 'Verifying token with Supabase');

        // Verify the token and get user data
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);

        if (error) {
          logAuth(request, 'Invalid token from Supabase', {
            error: error.message,
            status: error.status,
          });
          return reply.code(401).send({ error: 'Unauthorized: Invalid token' });
        }

        if (!user) {
          logAuth(request, 'No user found for provided token');
          return reply.code(401).send({ error: 'Unauthorized: Invalid token' });
        }

        logAuth(request, 'Token valid, user authenticated', {
          userId: user.id.substring(0, 8),
          email: user.email,
        });

        // Get the tenant_id for this user from our users table
        logAuth(request, 'Fetching tenant_id for user', {
          userId: user.id.substring(0, 8),
        });
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (userError) {
          logAuth(request, 'Error fetching user data from database', {
            userId: user.id.substring(0, 8),
            error: userError.message,
            code: userError.code,
          });
          return reply
            .code(401)
            .send({ error: 'Unauthorized: User not found' });
        }

        if (!userData) {
          logAuth(request, 'User not found in database', {
            userId: user.id.substring(0, 8),
          });
          return reply
            .code(401)
            .send({ error: 'Unauthorized: User not found' });
        }

        logAuth(request, 'Authentication successful', {
          userId: user.id.substring(0, 8),
          tenantId: userData.tenant_id.substring(0, 8),
        });

        // Attach user data to request
        request.user = {
          user_id: user.id,
          tenant_id: userData.tenant_id,
        };
      } catch (err) {
        const error = err as Error;
        fastify.log.error({
          auth: true,
          route: request.url,
          method: request.method,
          reqId: request.id,
          error: error.message,
          stack: error.stack,
        });
        return reply
          .code(401)
          .send({ error: 'Unauthorized: Authentication failed' });
      }
    }
  );
});
