import { beforeAll, describe, expect, it } from 'bun:test'
import { buildApp } from '../build/build.js'

describe('Health check', () => {
  let server: Awaited<ReturnType<typeof buildApp>>

  beforeAll(async () => {
    server = await buildApp()
  })

  it('should return 200', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    })
    expect(response.statusCode).toBe(200)
  })
})
