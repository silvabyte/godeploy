import 'dotenv/config';
import chalk from 'chalk';
import ora from 'ora';
import { request } from 'undici';
import http from 'http';
import type { AddressInfo } from 'net';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';
import { createServer } from 'node:http';

// ===== Constants =====
let API_URL = process.env.API_URL || 'http://localhost:38444';
const CLI_CALLBACK_PORT = 38389; // Port CLI uses for callback
const MOCK_API_PORT = 38445; // Port for our mock API server if needed

// ===== Types =====
interface AuthInitRequest {
  email: string;
  redirect_uri: string;
}

interface AuthInitResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface VerifyResponse {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    tenant_id: string;
  };
  error?: string;
}

// ===== Assertion Utilities =====
const assert = {
  text: {
    success: (text: string) => chalk.bold.green(`Success: `) + text,
    failed: (text: string) => chalk.bold.red(`Failed: `) + text,
    info: (text: string) => chalk.bold.blue(`Info: `) + text,
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

// ===== Mock API Server (for development/testing) =====
async function startMockApiServer(): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      // Buffer for request body
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        // Handle different routes
        if (req.url === '/api/auth/init' && req.method === 'POST') {
          try {
            const data = JSON.parse(body) as AuthInitRequest;
            console.log(
              `Mock API received auth init request for ${data.email}`
            );

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: true,
                message: 'Check your email for the login link.',
              })
            );
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: false,
                error: 'Invalid request body',
              })
            );
          }
        } else if (req.url === '/api/auth/verify' && req.method === 'GET') {
          const authHeader = req.headers.authorization;

          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                valid: false,
                error: 'Missing or invalid authorization header',
              })
            );
            return;
          }

          const token = authHeader.split(' ')[1];
          const testToken = process.env.TEST_AUTH_TOKEN;

          if (token === testToken) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                valid: true,
                user: {
                  id: 'mock-user-id',
                  email: 'test@example.com',
                  tenant_id: 'mock-tenant-id',
                },
              })
            );
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                valid: false,
                error: 'Invalid token',
              })
            );
          }
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              error: 'Not found',
            })
          );
        }
      });
    });

    server.listen(MOCK_API_PORT, () => {
      console.log(
        `Mock API server running at http://localhost:${MOCK_API_PORT}`
      );
      resolve(server);
    });
  });
}

// ===== CallbackServer class =====
class CallbackServer {
  private server: http.Server;
  private resolveToken: (token: string | null) => void = () => {};

  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = new URL(
      req.url || '/',
      `http://localhost:${CLI_CALLBACK_PORT}`
    );
    console.log(assert.text.info(`Callback received: ${url.pathname}`));

    // Extract token from query params (as the CLI would)
    const token = url.searchParams.get('access_token');

    // Send a response that the CLI would display
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
      '<html><body><h1>Authentication Successful</h1><p>You can close this window and return to the CLI.</p></body></html>'
    );

    // Resolve the promise with the token
    this.resolveToken(token);

    // Close the server after handling the request
    setTimeout(() => this.server.close(), 100);
  }

  async start(): Promise<number> {
    return new Promise((resolve) => {
      this.server.listen(CLI_CALLBACK_PORT, () => {
        const address = this.server.address() as AddressInfo;
        resolve(address.port);
      });
    });
  }

  async waitForToken(): Promise<string | null> {
    return new Promise((resolve) => {
      this.resolveToken = resolve;
    });
  }
}

/**
 * Step 1: Simulate InitAuth flow
 * This function tests the auth initialization endpoint that the CLI uses
 */
async function testAuthInitialization(
  email: string,
  authText: string
): Promise<boolean> {
  console.log(`${authText}: simulating auth initialization`);
  console.log(`Using email: ${email}`);
  const spinner = assert.spinner('Initializing auth flow');

  try {
    // Create redirect URI like the CLI would
    const redirectUri = `http://localhost:${CLI_CALLBACK_PORT}/callback`;

    // Prepare auth init request (like in InitAuth Go function)
    const reqBody: AuthInitRequest = {
      email,
      redirect_uri: redirectUri,
    };

    // Debug log the request
    console.log('Request body:', JSON.stringify(reqBody, null, 2));

    // Send auth init request
    const response = await request(`${API_URL}/api/auth/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });

    const statusCode = response.statusCode;
    const data = (await response.body.json()) as AuthInitResponse;

    // Debug log the response
    console.log('Response status:', statusCode);
    console.log('Response data:', JSON.stringify(data, null, 2));

    spinner.succeed(`Auth init response received with status ${statusCode}`);

    // Validate response
    const validStatus = assert.equal(statusCode, 200);
    const hasSuccessProperty = assert.hasProperty(data, 'success');
    const successValue = data.success === true;

    if (hasSuccessProperty && !successValue) {
      console.log(
        chalk.bold.red(
          `Failed: success property is ${data.success}, expected true`
        )
      );
    } else if (hasSuccessProperty && successValue) {
      console.log(chalk.bold.green(`Success: success property is true`));
    }

    const hasMessageProperty = assert.hasProperty(data, 'message');
    if (hasMessageProperty) {
      console.log(chalk.bold.green(`Message: ${data.message}`));
    }

    const allChecksPass =
      validStatus && hasSuccessProperty && successValue && hasMessageProperty;

    if (allChecksPass) {
      console.log(assert.text.success('Auth initialization passed all checks'));
      console.log(assert.text.info(`A magic link would be sent to: ${email}`));
      console.log(assert.text.info(`Redirect URL: ${redirectUri}`));
    } else {
      console.log(assert.text.failed('Auth initialization failed some checks'));
    }

    // Explain the CLI flow for context
    explainAuthFlow();

    return allChecksPass;
  } catch (error) {
    spinner.fail('Error initializing auth');
    console.error(error);
    return false;
  }
}

/**
 * Explains the CLI auth flow in the console
 */
function explainAuthFlow(): void {
  console.log('\nIn a real CLI flow:');
  console.log('1. The user would receive an email with a magic link');
  console.log(
    '2. Clicking the link would redirect to API with auth hash parameters'
  );
  console.log('3. API would redirect to CLI callback URL with the token');
  console.log('4. CLI would extract and store the token for future requests');
}

/**
 * Step 2: Simulate callback server
 * This function simulates the CLI's local callback server that receives tokens
 */
async function testCallbackServer(authText: string): Promise<string | null> {
  console.log(`\n${authText}: simulating callback server`);
  const callbackSpinner = assert.spinner('Starting callback server');

  try {
    const callbackServer = new CallbackServer();
    const port = await callbackServer.start();

    callbackSpinner.succeed(`Callback server started on port ${port}`);
    console.log(
      assert.text.info(
        'Waiting for token (would normally come from magic link click)...'
      )
    );

    // Generate a simulated token (for testing only)
    const simulatedToken = nanoid(64);

    // Simulate a redirect from the API with the token
    setTimeout(async () => {
      try {
        await request(
          `http://localhost:${port}/callback?access_token=${simulatedToken}`,
          { method: 'GET' }
        );
      } catch (e) {
        console.error('Error simulating callback:', e);
      }
    }, 1000);

    // Wait for the token to be received
    const receivedToken = await callbackServer.waitForToken();

    if (receivedToken) {
      console.log(
        assert.text.success(
          `Token received: ${receivedToken.substring(0, 10)}...`
        )
      );
      return receivedToken;
    } else {
      console.log(assert.text.failed('No token received'));
      return null;
    }
  } catch (error) {
    callbackSpinner.fail('Error with callback server');
    console.error(error);
    return null;
  }
}

/**
 * Step 3: Verify token
 * This function tests the token verification endpoint that the CLI uses
 */
async function testTokenVerification(
  token: string,
  authText: string
): Promise<boolean> {
  console.log(`\n${authText}: verifying token (VerifyToken function)`);
  const tokenSpinner = assert.spinner('Verifying token with API');

  try {
    const response = await request(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const statusCode = response.statusCode;
    const data = (await response.body.json()) as VerifyResponse;

    tokenSpinner.succeed(`Verify response received with status ${statusCode}`);

    // Validate response
    if (data.valid) {
      console.log(assert.text.success('Token is valid'));
      const hasUserProperty = assert.hasProperty(data, 'user');

      if (hasUserProperty && data.user) {
        console.log(chalk.bold.green(`User ID: ${data.user.id}`));
        console.log(chalk.bold.green(`User Email: ${data.user.email}`));
        console.log(chalk.bold.green(`User Tenant ID: ${data.user.tenant_id}`));
      }

      return true;
    } else {
      console.log(
        assert.text.failed(`Token verification failed: ${data.error}`)
      );
      return false;
    }
  } catch (error) {
    tokenSpinner.fail('Error verifying token');
    console.error(error);
    return false;
  }
}

/**
 * Main function that orchestrates the CLI auth smoke test
 */
async function main(): Promise<void> {
  // Validate required environment variables
  const email = process.env.TEST_EMAIL || '';
  if (!email) {
    throw new Error(
      'TEST_EMAIL environment variable is required for CLI auth smoke test'
    );
  }

  const authText = chalk.bold.magenta('CLI Auth');
  let mockServer: http.Server | null = null;
  let originalApiUrl = API_URL;

  // Start mock API server if requested
  if (process.env.USE_MOCK_API === 'true') {
    console.log(assert.text.info('Starting mock API server for testing'));
    mockServer = await startMockApiServer();

    // Override API_URL to point to our mock server
    API_URL = `http://localhost:${MOCK_API_PORT}`;
    console.log(assert.text.info(`Using mock API at ${API_URL}`));
  }

  try {
    // Step 1: Test auth initialization
    await testAuthInitialization(email, authText);

    // Step 2: Test callback server (optional)
    const shouldRunCallbackDemo = process.env.RUN_CALLBACK_DEMO === 'true';
    let receivedToken: string | null = null;

    if (shouldRunCallbackDemo) {
      receivedToken = await testCallbackServer(authText);
    }

    // Step 3: Test token verification
    const validToken = process.env.TEST_AUTH_TOKEN;

    if (validToken) {
      await testTokenVerification(validToken, authText);
    } else {
      console.log(
        assert.text.info(
          '\nSkipping token verification - set TEST_AUTH_TOKEN to test this step'
        )
      );
    }

    console.log(`\n${authText}: smoke tests completed`);
  } finally {
    // Restore original API URL
    if (process.env.USE_MOCK_API === 'true') {
      API_URL = originalApiUrl;
    }

    // Clean up mock server if it was started
    if (mockServer) {
      mockServer.close();
      console.log(assert.text.info('Mock API server stopped'));
    }
  }
}

// Run the main function with error handling
main().catch((error) => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
});
