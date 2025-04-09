import 'dotenv/config';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { nanoid } from 'nanoid';
import FormData from 'form-data';
import { request } from 'undici';
import { Zip } from '../app/components/storage/Zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'http://localhost:38444';

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
};

/**
 * Deploy API Smoke Test
 *
 * This test verifies that the deploy functionality works end-to-end
 * without mocking any services.
 *
 * To run this test:
 * 1. Set the TEST_AUTH_TOKEN environment variable with a valid auth token
 *    Example: TEST_AUTH_TOKEN=your_token npm run test:smoke
 *
 * 2. Optionally set TEST_PROJECT_NAME to specify a project name
 *    Example: TEST_PROJECT_NAME=my-test-project npm run test:smoke
 *
 * 3. Ensure you have a development environment with proper database and
 *    storage services configured.
 *
 * Note: This test creates real resources in your development environment.
 */

const main = async () => {
  let authToken: string;
  let projectId: string;

  // Get auth token from env or hardcode a test token
  authToken = process.env.TEST_AUTH_TOKEN || '';
  if (!authToken) {
    throw new Error(
      'TEST_AUTH_TOKEN environment variable is required for smoke tests'
    );
  }

  // Get project name from env or use default
  const projectName =
    process.env.TEST_PROJECT_NAME || 'godeploy-smoke-test-' + nanoid(8);
  console.log(
    `${chalk.bold.magenta('Starting test for project')} ${projectName}`
  );

  const deploymentText = chalk.bold.magenta('Deployment');

  console.log(`${deploymentText}: creating zip`);

  // Create a temporary directory for our test files
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'deploy-test-'));

  const indexPath = path.join(tempDir, 'index.html');

  // Copy the test index.html file
  fs.copyFileSync(path.join(__dirname, 'dist', 'index.html'), indexPath);

  // Create a zip file with the HTML file
  const zipPath = path.join(tempDir, 'deploy.zip');

  // For this smoke test, we'll just create a simple file to simulate the upload
  await Zip.create(tempDir, zipPath);

  // Create form data for file upload
  const form = new FormData();
  form.append('file', fs.createReadStream(zipPath));

  console.log(`${deploymentText}: uploading zip`);
  const response = await request(
    `${API_URL}/api/deploy?project=${projectName}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        ...form.getHeaders(),
      },
      body: form,
    }
  );

  if (!assert.equal(response.statusCode, 200)) {
    console.debug(response.statusCode);
    console.debug(await response.body.text());
    return;
  }

  console.log(`${deploymentText}: uploaded zip`);
  const deploy = (await response.body.json()) as { id: string };
  console.log(deploy);

  console.log(`${deploymentText}: getting deployments`);

  // Verify the deploy was created correctly
  const getDeployResponse = await request(
    `${API_URL}/api/deploys/${deploy.id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!assert.equal(getDeployResponse.statusCode, 200)) {
    console.debug(getDeployResponse.statusCode);
    console.debug(await getDeployResponse.body.text());
    return;
  }

  console.log(`${deploymentText}: got deployments`);
  const deployDetails = (await getDeployResponse.body.json()) as { id: string };
  console.log(deployDetails);
  assert.equal(deployDetails.id, deploy.id);
  console.log(`${deploymentText}: got deployment details`);

  console.log(`${deploymentText}: cleaning up`);
  // Clean up temp files
  fs.unlinkSync(indexPath);
  fs.unlinkSync(zipPath);
  fs.rmdirSync(tempDir);
  console.log(`${deploymentText}: cleaned up`);
};

main();
