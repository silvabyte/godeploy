import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { DatabaseService } from '../components/db/DatabaseService'

// Extend FastifyInstance and FastifyRequest to include our services
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseService
  }

  interface FastifyRequest {
    db: DatabaseService
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize services
  const db = new DatabaseService(fastify.supabase)

  // Decorate fastify with our services
  fastify.decorate('db', db)

  // Add type safety for the decorated properties
  fastify.decorateRequest('db', {
    getter: () => db,
    setter: (value: DatabaseService) => value,
  })

  // Add the services to each request
  fastify.addHook('onRequest', async (request) => {
    request.db = db
  })
}

export default fp(dbPlugin, {
  name: 'db',
  fastify: '5.x',
  dependencies: ['supabaseAuth'],
  decorators: {
    fastify: ['supabase'],
  },
})
