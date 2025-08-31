import 'dotenv/config'
import chalk from 'chalk'
import ora from 'ora'
import { request } from 'undici'

const API_URL = process.env.API_URL || 'http://localhost:38444'

const assert = {
  text: {
    success: (text: string) => {
      return chalk.bold.green(`Success: `) + text
    },
    failed: (text: string) => {
      return chalk.bold.red(`Failed: `) + text
    },
    assert: (text: string) => {
      return chalk.bold.cyan(`Assert: `) + text
    },
  },
  spinner: (text: string) => {
    return ora({
      text: chalk.bold.cyan(text),
      color: 'cyan',
    }).start()
  },
  equal: (a: any, b: any) => {
    if (a !== b) {
      return false
    } else {
      return true
    }
  },
  hasProperty: (obj: any, prop: string) => {
    if (obj && Object.hasOwn(obj, prop)) {
      return true
    } else {
      return false
    }
  },
}

/**
 * Auth Verification Smoke Test
 *
 * This test verifies that the auth verification functionality works end-to-end
 * without mocking any services.
 *
 * To run this test:
 * 1. Set the TEST_AUTH_TOKEN environment variable with a valid auth token
 *    Example: TEST_AUTH_TOKEN=your_token npm run test:auth
 *
 * 2. Optionally set INVALID_AUTH_TOKEN to a known invalid token to test error handling
 *    Example: INVALID_AUTH_TOKEN=bad_token npm run test:auth
 *
 * Note: This test requires an API server running on the configured API_URL
 */

const runValidTokenTest = async () => {
  const validToken = process.env.TEST_AUTH_TOKEN || ''
  if (!validToken) throw new Error('TEST_AUTH_TOKEN is required')

  const spinner = assert.spinner('Verifying valid token')
  try {
    const res = await request(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${validToken}` },
    })
    const data = await res.body.json()
    spinner.succeed(`Response received with status ${res.statusCode}`)
    verifyAuthResponse(res.statusCode, data, true)
  } catch (_err) {
    spinner.fail('Error verifying valid token')
  }
}

const runInvalidTokenTest = async () => {
  const token = process.env.INVALID_AUTH_TOKEN || 'invalid-token'
  const spinner = assert.spinner('Verifying invalid token')
  try {
    const res = await request(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.body.json()
    spinner.succeed(`Response received with status ${res.statusCode}`)
    verifyAuthResponse(res.statusCode, data, false)
  } catch (_err) {
    spinner.fail('Error verifying invalid token')
  }
}

const runMissingTokenTest = async () => {
  const spinner = assert.spinner('Testing request with no token')
  try {
    const res = await request(`${API_URL}/api/auth/verify`, { method: 'GET' })
    const data = await res.body.json()
    spinner.succeed(`Response received with status ${res.statusCode}`)
    verifyAuthResponse(res.statusCode, data, false)
  } catch (_err) {
    spinner.fail('Error testing missing token')
  }
}

const verifyAuthResponse = (statusCode: number, data: any, shouldBeValid: boolean) => {
  const expectedStatus = shouldBeValid ? 200 : 401
  const expectedValidity = !!shouldBeValid
  const statusOK = assert.equal(statusCode, expectedStatus)
  const hasValid = assert.hasProperty(data, 'valid')
  const isValid = data.valid === expectedValidity

  if (hasValid && isValid) {
  } else {
  }

  const hasError = !shouldBeValid && assert.hasProperty(data, 'error')
  if (hasError) 

  const hasUser =
    shouldBeValid &&
    assert.hasProperty(data, 'user') &&
    assert.hasProperty(data.user, 'id') &&
    assert.hasProperty(data.user, 'email') &&
    assert.hasProperty(data.user, 'tenant_id')

  if (shouldBeValid && hasUser) {
  }

  const _passed = shouldBeValid
    ? statusOK && hasValid && isValid && hasUser
    : statusOK && hasValid && isValid && hasError

  const _summary = shouldBeValid
    ? 'Valid token verification'
    : statusCode === 401
      ? 'Invalid token verification'
      : 'Missing token test'
}

const main = async () => {
  const _authText = chalk.bold.magenta('Auth')
  await runValidTokenTest()
  await runInvalidTokenTest()
  await runMissingTokenTest()
}

main().catch((_error) => {
  process.exit(1)
})
