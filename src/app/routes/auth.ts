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
      request.measure.start('auth_init', {
        email: request.body.email,
      });
      try {
        const { email } = request.body;
        const redirectUrl = 'http://localhost:38389/callback'; // cli will be listening on this port

        request.measure.add('supabase_auth_signinwithotp');
        // Use Supabase OTP to send a magic link
        const { error } = await fastify.supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${
              process.env.APP_URL || 'https://api.godeploy.app'
            }/magic-link?redirect_to=${encodeURIComponent(redirectUrl)}`,
          },
        });

        if (error) {
          request.measure.failure(error);
          fastify.log.error(error);
          return reply.code(400).send({
            success: false,
            error: error.message,
          });
        }

        request.measure.success();

        // Log the action in development mode
        fastify.log.info(
          `Magic link sent to ${email} with redirect to ${redirectUrl}`
        );

        return reply.code(200).send({
          success: true,
          message: 'Check your email for the login link.',
        });
      } catch (error) {
        request.measure.failure(error);
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
        required: ['redirect_to'],
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
      request.measure.start('magic_link');
      try {
        const { redirect_to, token } = request.query;

        // Check if the token contains a hash with access_token
        // This happens when Supabase redirects with the authentication data in the URL fragment
        if (request.raw.url) {
          const urlString = request.raw.url;
          // Extract all hash parameters
          const hashMatch = urlString.match(/#(.+)$/);
          request.measure.add('hash_match', {
            hash_match: !!hashMatch,
            url_string: urlString,
          });

          if (hashMatch && hashMatch[1]) {
            const hashParams = new URLSearchParams(hashMatch[1]);
            const accessToken = hashParams.get('access_token');

            if (accessToken) {
              // Get all hash parameters to convert to query parameters
              const redirectUrl = new URL(redirect_to);

              // Convert all hash parameters to query parameters
              for (const [key, value] of hashParams.entries()) {
                redirectUrl.searchParams.set(key, value);
              }

              request.measure.success();
              return reply.redirect(redirectUrl.toString());
            }
          }
        }
        request.measure.add('no_hash_match');

        // Fallback to the original behavior if no access_token is found
        // Only proceed with token from query if it exists
        if (token) {
          const redirectUrl = new URL(redirect_to);
          redirectUrl.searchParams.set('access_token', token);
          request.measure.success();
          return reply.redirect(redirectUrl.toString());
        } else {
          // If no token is found in hash or query, log the issue
          fastify.log.warn('No token found in hash or query parameters');
          const redirectUrl = new URL(redirect_to);
          request.measure.success();
          return reply.redirect(redirectUrl.toString());
        }
      } catch (error) {
        fastify.log.error(error);
        request.measure.failure(error);
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
      request.measure.start('auth_verify');
      try {
        request.measure.add('get_token_from_auth_header');
        const token = request.headers.authorization?.split(' ')[1];

        if (!token) {
          request.measure.failure('Unauthorized: Missing token');
          return reply.code(401).send({
            valid: false,
            error: 'Unauthorized: Missing token',
          });
        }

        request.measure.add('get_user_auth_from_supabase');
        // Verify the token and get user data
        const {
          data: { user },
          error,
        } = await fastify.supabase.auth.getUser(token);

        if (error || !user) {
          if (error) {
            request.measure.failure(error);
          } else {
            request.measure.failure('Unauthorized: Invalid token');
          }
          return reply.code(401).send({
            valid: false,
            error: 'Unauthorized: Invalid token',
          });
        }

        request.measure.add('get_user_tenant_id_from_supabase');
        // Get the tenant_id for this user from our users table
        const { data: userData, error: userError } = await fastify.supabase
          .from('users')
          .select('tenant_id')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          request.measure.failure(userError ?? 'Unauthorized: User not found');
          return reply.code(401).send({
            valid: false,
            error: 'Unauthorized: User not found',
          });
        }

        request.measure.success();

        return reply.code(200).send({
          valid: true,
          user: {
            id: user.id,
            email: user.email,
            tenant_id: userData.tenant_id,
          },
        });
      } catch (error) {
        request.measure.failure(error);
        fastify.log.error(error);
        return reply.code(401).send({
          valid: false,
          error: 'Unauthorized: Authentication failed',
        });
      }
    },
  });
}
