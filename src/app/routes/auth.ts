import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  routeSchemas,
  type AuthInitBody,
  type MagicLinkQuerystring,
} from '../components/auth/auth.types';
import {
  parseUrlHash,
  addTokenToUrl,
  extractBearerToken,
} from '../components/auth/token-utils';

export default async function (fastify: FastifyInstance) {
  // Initialize authentication flow
  fastify.post('/api/auth/init', {
    ...routeSchemas.authInit,
    config: {
      auth: false, // Skip auth for this route
    },
    handler: async (
      request: FastifyRequest<{
        Body: AuthInitBody;
      }>,
      reply: FastifyReply
    ) => {
      request.measure.start('auth_init', {
        email: request.body.email,
      });

      const { email } = request.body;
      const redirectUrl = 'http://localhost:38389/callback'; // cli will be listening on this port
      const magicLinkUrl = `${
        process.env.APP_URL || 'https://api.godeploy.app'
      }/magic-link?redirect_to=${encodeURIComponent(redirectUrl)}`;

      const result = await request.db.auth.sendMagicLink(email, magicLinkUrl);

      if (result.error) {
        request.measure.failure(result.error);
        return reply.code(400).send({
          success: false,
          error: result.error,
        });
      }

      request.measure.success();
      return reply.code(200).send({
        success: true,
        message: 'Check your email for the login link.',
      });
    },
  });

  // Handle magic link callback from Supabase
  fastify.get('/magic-link', {
    ...routeSchemas.magicLink,
    config: {
      auth: false, // Skip auth for this route
    },
    handler: async (
      request: FastifyRequest<{
        Querystring: MagicLinkQuerystring;
      }>,
      reply: FastifyReply
    ) => {
      request.measure.start('magic_link');
      try {
        const { redirect_to, token } = request.query;

        // First try to parse hash parameters if they exist
        if (request.raw.url) {
          request.measure.add('parse_url_hash');
          const hashResult = parseUrlHash(request.raw.url, redirect_to);

          if (hashResult.error) {
            request.measure.failure(hashResult.error);
            return reply.code(500).send({
              success: false,
              error: 'Failed to process authentication response',
            });
          }

          if (hashResult.data?.hasToken) {
            request.measure.success();
            return reply.redirect(hashResult.data.redirectUrl.toString());
          }
        }

        // If no hash token found, try query parameter token
        if (token) {
          request.measure.add('add_query_token');
          const urlResult = addTokenToUrl(redirect_to, token);

          if (urlResult.error) {
            request.measure.failure(urlResult.error);
            return reply.code(500).send({
              success: false,
              error: 'Failed to process authentication token',
            });
          }

          request.measure.success();
          return reply.redirect(urlResult.data!.toString());
        }

        // If no token found anywhere, redirect without token
        request.measure.add('no_token');
        request.measure.success();
        return reply.redirect(redirect_to);
      } catch (error) {
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
    ...routeSchemas.authVerify,
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      request.measure.start('auth_verify');

      request.measure.add('extract_bearer_token');
      const tokenResult = extractBearerToken(request.headers.authorization);

      if (tokenResult.error) {
        request.measure.failure(tokenResult.error);
        return reply.code(401).send({
          valid: false,
          error: tokenResult.error,
        });
      }

      const result = await request.db.auth.getUserByToken(tokenResult.data!);

      if (result.error || !result.data) {
        request.measure.failure(result.error || 'Unauthorized: Invalid token');
        return reply.code(401).send({
          valid: false,
          error: result.error || 'Unauthorized: Invalid token',
        });
      }

      request.measure.success();
      return reply.code(200).send({
        valid: true,
        user: result.data,
      });
    },
  });
}
