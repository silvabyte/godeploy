import type { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  // Prefer env-provided version to avoid fs I/O
  const version = process.env.APP_VERSION || process.env.npm_package_version || 'dev'

  fastify.get(
    '/',
    {
      config: {
        auth: false,
      },
    },
    async function () {
      //add api metadata
      return { version, api: 'godeploy-api', status: 'ok' }
    },
  )
}
