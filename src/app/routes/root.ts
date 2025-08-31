import fs from 'node:fs'
import type { FastifyInstance } from 'fastify'

export default async function (fastify: FastifyInstance) {
  //load version from package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as {
    version: string
  }
  const version = packageJson.version

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
