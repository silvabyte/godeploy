import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

// Interface for the auth init request
interface AuthInitRequest {
  Body: {
    email: string;
    redirect_uri: string;
  };
}

// Interface for the magic link request
interface MagicLinkRequest {
  Querystring: {
    redirect_to: string;
    token: string;
  };
}

export default async function (fastify: FastifyInstance) {
  // Initialize authentication flow
  fastify.post('/api/auth/init', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'redirect_uri'],
        properties: {
          email: { type: 'string', format: 'email' },
          redirect_uri: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    config: {
      auth: false, // Skip auth for this route
    },
    handler: async (
      request: FastifyRequest<AuthInitRequest>,
      reply: FastifyReply
    ) => {
      try {
        const { email } = request.body;
        const redirectUrl = 'http://localhost:38389'; // cli will be listening on this port

        // Use Supabase OTP to send a magic link
        const { data, error } = await fastify.supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${
              process.env.APP_URL || 'https://api.godeploy.app'
            }/magic-link?redirect_to=${encodeURIComponent(redirectUrl)}`,
          },
        });

        if (error) {
          fastify.log.error(error);
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }

        // Log the action in development mode
        fastify.log.info(
          `Magic link sent to ${email} with redirect to ${redirectUrl}`
        );

        return reply.code(200).send({
          success: true,
          message: 'Check your email for the login link.',
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    },
  });

  // Handle magic link callback from Supabase
  fastify.get('/magic-link', {
    schema: {
      querystring: {
        type: 'object',
        required: ['redirect_to', 'token'],
        properties: {
          redirect_to: { type: 'string' },
          token: { type: 'string' },
        },
      },
    },
    config: {
      auth: false, // Skip auth for this route
    },
    handler: async (
      request: FastifyRequest<MagicLinkRequest>,
      reply: FastifyReply
    ) => {
      //TODO: add check if token is valid
      try {
        const { redirect_to, token } = request.query;
        const redirectUrl = new URL(redirect_to);
        redirectUrl.searchParams.set('token', token);
        return reply.redirect(redirectUrl.toString());
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          success: false,
          error: 'Internal server error',
        });
      }
    },
  });

  // Endpoint to verify a token (useful for CLI to check if token is valid)
  fastify.get('/api/auth/verify', {
    schema: {
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                tenant_id: { type: 'string' },
              },
            },
          },
        },
        401: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
          return reply.code(401).send({
            valid: false,
            error: 'Unauthorized: Missing token',
          });
        }

        // Verify the token and get user data
        const {
          data: { user },
          error,
        } = await fastify.supabase.auth.getUser(token);

        if (error || !user) {
          return reply.code(401).send({
            valid: false,
            error: 'Unauthorized: Invalid token',
          });
        }

        // Get the tenant_id for this user from our users table
        const { data: userData, error: userError } = await fastify.supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          return reply.code(401).send({
            valid: false,
            error: 'Unauthorized: User not found',
          });
        }

        return reply.code(200).send({
          valid: true,
          user: {
            id: user.id,
            email: user.email,
            tenant_id: userData.tenant_id,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(401).send({
          valid: false,
          error: 'Unauthorized: Authentication failed',
        });
      }
    },
  });
}
