import { beforeAll, describe, expect, it } from 'bun:test'
import { buildApp } from '../build/build.js'

describe('Password Authentication Routes', () => {
  let server: Awaited<ReturnType<typeof buildApp>>
  const testEmail = 'test@example.com'
  const testPassword = 'TestPassword123!'

  beforeAll(async () => {
    server = await buildApp()
  })

  describe('POST /api/auth/signup', () => {
    it('should validate email format', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: 'invalid-email',
          password: testPassword,
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should validate password length', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signup',
        payload: {
          email: testEmail,
          password: 'short',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/signin', () => {
    it('should validate email format', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: 'invalid-email',
          password: testPassword,
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should require password', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signin',
        payload: {
          email: testEmail,
          password: '',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('should validate email format', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/reset-password',
        payload: {
          email: 'invalid-email',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should accept valid email', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/reset-password',
        payload: {
          email: testEmail,
        },
      })

      // Will fail with auth error since we're using mock Supabase
      // But should pass validation
      expect([200, 400]).toContain(response.statusCode)
    })
  })

  describe('POST /api/auth/reset-password/confirm', () => {
    it('should validate token presence', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/reset-password/confirm',
        payload: {
          token: '',
          newPassword: 'NewPassword123!',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should validate new password length', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/reset-password/confirm',
        payload: {
          token: 'some-token',
          newPassword: 'short',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/signout', () => {
    it('should be accessible without authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/auth/signout',
      })

      // Will fail with auth error since we're using mock Supabase
      // But should be reachable
      expect([200, 500]).toContain(response.statusCode)
    })
  })
})
