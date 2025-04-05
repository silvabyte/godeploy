import 'dotenv/config';
import chalk from 'chalk';
import ora from 'ora';
import { request } from 'undici';

const API_URL = process.env.API_URL || 'http://localhost:38444';

const assert = {
  text: {
    success: (text: string) => {
      return chalk.bold.green(`Success: `) + text;
    },
    failed: (text: string) => {
      return chalk.bold.red(`Failed: `) + text;
    },
    assert: (text: string) => {
      return chalk.bold.cyan(`Assert: `) + text;
    },
  },
  spinner: (text: string) => {
    return ora({
      text: chalk.bold.cyan(text),
      color: 'cyan',
    }).start();
  },
  equal: (a: any, b: any) => {
    console.log(chalk.bold.cyan(`Asserting: ${a} === ${b}`));
    if (a !== b) {
      console.log(chalk.bold.red(`Failed: ${a} !== ${b}`));
      return false;
    } else {
      console.log(chalk.bold.green(`Success: ${a} === ${b}`));
      return true;
    }
  },
  hasProperty: (obj: any, prop: string) => {
    console.log(chalk.bold.cyan(`Asserting: object has property "${prop}"`));
    if (obj && Object.prototype.hasOwnProperty.call(obj, prop)) {
      console.log(chalk.bold.green(`Success: object has property "${prop}"`));
      return true;
    } else {
      console.log(
        chalk.bold.red(`Failed: object is missing property "${prop}"`)
      );
      return false;
    }
  },
};

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

const main = async () => {
  // Get auth token from env
  const validToken = process.env.TEST_AUTH_TOKEN || '';
  if (!validToken) {
    throw new Error(
      'TEST_AUTH_TOKEN environment variable is required for auth smoke tests'
    );
  }

  const invalidToken = process.env.INVALID_AUTH_TOKEN || 'invalid-token';

  const authText = chalk.bold.magenta('Auth');

  // Test 1: Verify a valid token
  console.log(`${authText}: verifying valid token`);
  let spinner = assert.spinner('Verifying valid token');

  try {
    const response = await request(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });

    const statusCode = response.statusCode;
    const data = (await response.body.json()) as any;

    spinner.succeed(`Response received with status ${statusCode}`);

    // Assert response status code is 200
    const validStatus = assert.equal(statusCode, 200);

    // Assert response has valid: true
    const hasValidProperty = assert.hasProperty(data, 'valid');
    const validPropertyValue = data.valid === true;

    if (hasValidProperty && !validPropertyValue) {
      console.log(
        chalk.bold.red(`Failed: valid property is ${data.valid}, expected true`)
      );
    } else if (hasValidProperty && validPropertyValue) {
      console.log(chalk.bold.green(`Success: valid property is true`));
    }

    // Assert response has user object with required properties
    const hasUserProperty = assert.hasProperty(data, 'user');

    if (hasUserProperty) {
      const user = data.user;
      const hasIdProperty = assert.hasProperty(user, 'id');
      const hasEmailProperty = assert.hasProperty(user, 'email');
      const hasTenantIdProperty = assert.hasProperty(user, 'tenant_id');

      if (hasIdProperty && hasEmailProperty && hasTenantIdProperty) {
        console.log(
          chalk.bold.green(`Success: user object has all required properties`)
        );
        console.log(`User ID: ${user.id}`);
        console.log(`User Email: ${user.email}`);
        console.log(`User Tenant ID: ${user.tenant_id}`);
      }
    }

    if (
      validStatus &&
      hasValidProperty &&
      validPropertyValue &&
      hasUserProperty
    ) {
      console.log(
        assert.text.success('Valid token verification passed all checks')
      );
    } else {
      console.log(
        assert.text.failed('Valid token verification failed some checks')
      );
    }
  } catch (error) {
    spinner.fail('Error verifying valid token');
    console.error(error);
  }

  // Test 2: Verify an invalid token
  console.log(`\n${authText}: verifying invalid token`);
  spinner = assert.spinner('Verifying invalid token');

  try {
    const response = await request(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${invalidToken}`,
      },
    });

    const statusCode = response.statusCode;
    const data = (await response.body.json()) as any;

    spinner.succeed(`Response received with status ${statusCode}`);

    // For invalid token, we expect 401 Unauthorized
    const validStatus = assert.equal(statusCode, 401);

    // Assert response has valid: false
    const hasValidProperty = assert.hasProperty(data, 'valid');
    const validPropertyValue = data.valid === false;

    if (hasValidProperty && !validPropertyValue) {
      console.log(
        chalk.bold.red(
          `Failed: valid property is ${data.valid}, expected false`
        )
      );
    } else if (hasValidProperty && validPropertyValue) {
      console.log(chalk.bold.green(`Success: valid property is false`));
    }

    // Assert response has error message
    const hasErrorProperty = assert.hasProperty(data, 'error');

    if (hasErrorProperty) {
      console.log(chalk.bold.green(`Error message: ${data.error}`));
    }

    if (
      validStatus &&
      hasValidProperty &&
      validPropertyValue &&
      hasErrorProperty
    ) {
      console.log(
        assert.text.success('Invalid token verification passed all checks')
      );
    } else {
      console.log(
        assert.text.failed('Invalid token verification failed some checks')
      );
    }
  } catch (error) {
    spinner.fail('Error verifying invalid token');
    console.error(error);
  }

  // Test 3: Test missing token
  console.log(`\n${authText}: testing missing token`);
  spinner = assert.spinner('Testing request with no token');

  try {
    const response = await request(`${API_URL}/api/auth/verify`, {
      method: 'GET',
    });

    const statusCode = response.statusCode;
    const data = (await response.body.json()) as any;

    spinner.succeed(`Response received with status ${statusCode}`);

    // For missing token, we expect 401 Unauthorized
    const validStatus = assert.equal(statusCode, 401);

    // Assert response has valid: false
    const hasValidProperty = assert.hasProperty(data, 'valid');
    const validPropertyValue = data.valid === false;

    if (hasValidProperty && !validPropertyValue) {
      console.log(
        chalk.bold.red(
          `Failed: valid property is ${data.valid}, expected false`
        )
      );
    } else if (hasValidProperty && validPropertyValue) {
      console.log(chalk.bold.green(`Success: valid property is false`));
    }

    // Assert response has error message
    const hasErrorProperty = assert.hasProperty(data, 'error');

    if (hasErrorProperty) {
      console.log(chalk.bold.green(`Error message: ${data.error}`));
    }

    if (
      validStatus &&
      hasValidProperty &&
      validPropertyValue &&
      hasErrorProperty
    ) {
      console.log(assert.text.success('Missing token test passed all checks'));
    } else {
      console.log(assert.text.failed('Missing token test failed some checks'));
    }
  } catch (error) {
    spinner.fail('Error testing missing token');
    console.error(error);
  }

  console.log(`\n${authText}: smoke tests completed`);
};

main().catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
