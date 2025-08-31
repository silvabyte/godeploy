import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import sensible from '@fastify/sensible';

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.register(sensible);

  // Add error handler for validation errors
  fastify.setErrorHandler(function (error, _request, reply) {
    // Handle validation errors
    if (error.validation) {
      reply.status(400).send({
        success: false,
        error: 'Validation error',
        details: error.validation,
      });
      return;
    }

    // Handle other errors
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      success: false,
      error: error.message || 'Internal server error',
    });
  });
});
