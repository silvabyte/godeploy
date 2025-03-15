import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import fp from 'fastify-plugin';

// Create Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_API_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Extend FastifyRequest to include user property
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      user_id: string;
      tenant_id: string;
    };
  }

  interface FastifyContextConfig {
    auth?: boolean;
  }
}

export default fp(async (fastify) => {
  fastify.decorate('supabase', supabase);

  fastify.addHook(
    'preHandler',
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip auth for routes that don't need it
      if (request.routeOptions.config?.auth === false) {
        return;
      }

      try {
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
          return reply.code(401).send({ error: 'Unauthorized: Missing token' });
        }

        // Verify the token and get user data
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);

        if (error || !user) {
          return reply.code(401).send({ error: 'Unauthorized: Invalid token' });
        }

        // Get the tenant_id for this user from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          return reply
            .code(401)
            .send({ error: 'Unauthorized: User not found' });
        }

        // Attach user data to request
        request.user = {
          user_id: user.id,
          tenant_id: userData.tenant_id,
        };
      } catch (err) {
        fastify.log.error(err);
        return reply
          .code(401)
          .send({ error: 'Unauthorized: Authentication failed' });
      }
    }
  );
});
