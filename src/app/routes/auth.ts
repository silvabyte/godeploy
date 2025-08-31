import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  routeSchemas,
  type AuthInitBody,
  type MagicLinkQuerystring,
  type SignUpBody,
  type SignInBody,
  type ChangePasswordBody,
  type ResetPasswordRequestBody,
  type ResetPasswordConfirmBody,
} from '../components/auth/auth.types.js';
import {
  parseUrlHash,
  addTokenToUrl,
  extractBearerToken,
} from '../components/auth/token-utils.js';

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

      const { email, redirect_uri } = request.body;
      const magicLinkUrl = `${
        process.env.APP_URL || 'https://api.godeploy.app'
      }/magic-link?redirect_to=${encodeURIComponent(redirect_uri)}`;

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

  // Sign up with email and password
  fastify.post('/api/auth/signup', {
    ...routeSchemas.signUp,
    config: {
      auth: false, // Skip auth for this route
    },
    handler: async (
      request: FastifyRequest<{
        Body: SignUpBody;
      }>,
      reply: FastifyReply
    ) => {
      request.measure.start('auth_signup', {
        email: request.body.email,
      });

      const { email, password } = request.body;
      const result = await request.db.auth.signUp(email, password);

      if (result.error) {
        request.measure.failure(result.error);
        return reply.code(400).send({
          success: false,
          error: result.error,
        });
      }

      request.measure.success();
      return reply.code(201).send({
        success: true,
        token: result.data!.token,
        user: result.data!.user,
      });
    },
  });

  // Sign in with email and password
  fastify.post('/api/auth/signin', {
    ...routeSchemas.signIn,
    config: {
      auth: false, // Skip auth for this route
    },
    handler: async (
      request: FastifyRequest<{
        Body: SignInBody;
      }>,
      reply: FastifyReply
    ) => {
      request.measure.start('auth_signin', {
        email: request.body.email,
      });

      const { email, password } = request.body;
      const result = await request.db.auth.signIn(email, password);

      if (result.error) {
        request.measure.failure(result.error);
        return reply.code(401).send({
          success: false,
          error: result.error,
        });
      }

      request.measure.success();
      return reply.code(200).send({
        success: true,
        token: result.data!.token,
        user: result.data!.user,
      });
    },
  });

  // Change password for authenticated user
  fastify.post('/api/auth/change-password', {
    ...routeSchemas.changePassword,
    handler: async (
      request: FastifyRequest<{
        Body: ChangePasswordBody;
      }>,
      reply: FastifyReply
    ) => {
      request.measure.start('auth_change_password');

      const { currentPassword, newPassword } = request.body;

      // Extract token from authorization header
      const tokenResult = extractBearerToken(request.headers.authorization);
      if (tokenResult.error) {
        request.measure.failure(tokenResult.error);
        return reply.code(401).send({
          success: false,
          error: tokenResult.error,
        });
      }

      const result = await request.db.auth.changePassword(
        tokenResult.data!,
        currentPassword,
        newPassword
      );

      if (result.error) {
        request.measure.failure(result.error);
        return reply.code(401).send({
          success: false,
          error: result.error,
        });
      }

      request.measure.success();
      return reply.code(200).send({
        success: true,
        message: 'Password changed successfully',
      });
    },
  });

  // Request password reset
  fastify.post('/api/auth/reset-password', {
    ...routeSchemas.resetPasswordRequest,
    config: {
      auth: false, // Skip auth for this route
    },
    handler: async (
      request: FastifyRequest<{
        Body: ResetPasswordRequestBody;
      }>,
      reply: FastifyReply
    ) => {
      request.measure.start('auth_reset_password_request', {
        email: request.body.email,
      });

      const { email, redirect_uri } = request.body;
      const result = await request.db.auth.requestPasswordReset(
        email,
        redirect_uri
      );

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
        message: 'Password reset email sent',
      });
    },
  });

  // Confirm password reset with token
  fastify.post('/api/auth/reset-password/confirm', {
    ...routeSchemas.resetPasswordConfirm,
    config: {
      auth: false, // Skip auth for this route
    },
    handler: async (
      request: FastifyRequest<{
        Body: ResetPasswordConfirmBody;
      }>,
      reply: FastifyReply
    ) => {
      request.measure.start('auth_reset_password_confirm');

      const { token, newPassword } = request.body;
      const result = await request.db.auth.confirmPasswordReset(
        token,
        newPassword
      );

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
        message: 'Password reset successfully',
      });
    },
  });

  // Sign out
  fastify.post('/api/auth/signout', {
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      request.measure.start('auth_signout');

      const result = await request.db.auth.signOut();

      if (result.error) {
        request.measure.failure(result.error);
        return reply.code(500).send({
          success: false,
          error: result.error,
        });
      }

      request.measure.success();
      return reply.code(200).send({
        success: true,
        message: 'Signed out successfully',
      });
    },
  });

  // Endpoint to verify a token (useful for CLI to check if token is valid)
  fastify.get('/api/auth/verify', {
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      request.measure.start('auth_verify');

      try {
        // Extract token from authorization header using the utility function
        const tokenResult = extractBearerToken(request.headers.authorization);

        if (tokenResult.error) {
          request.measure.failure(tokenResult.error);
          return reply.code(401).send({
            valid: false,
            error: tokenResult.error,
          });
        }

        const token = tokenResult.data!;

        // Use Supabase client directly for token verification
        request.measure.add('verify_token');
        const { data, error } = await fastify.supabase.auth.getUser(token);

        if (error || !data.user) {
          const errorMsg = error?.message || 'Invalid token';
          request.measure.failure(errorMsg);
          return reply.code(401).send({
            valid: false,
            error: errorMsg,
          });
        }

        // Get tenant info for this user
        request.measure.add('get_tenant_info');
        const { data: userData, error: userError } = await fastify.supabase
          .from('users')
          .select('tenant_id')
          .eq('id', data.user.id)
          .single();

        if (userError || !userData) {
          request.measure.failure('User not found');
          return reply.code(401).send({
            valid: false,
            error: 'User not found',
          });
        }

        // Return successful response
        request.measure.success();
        return reply.code(200).send({
          valid: true,
          user: {
            id: data.user.id,
            email: data.user.email || '',
            tenant_id: userData.tenant_id,
          },
        });
      } catch (error) {
        // Ensure all errors include the 'valid' property
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        request.log.error('Auth verification error', { error: errorMessage });
        request.measure.failure(errorMessage);

        return reply.code(500).send({
          valid: false,
          error: 'Error verifying token',
        });
      }
    },
  });
}
