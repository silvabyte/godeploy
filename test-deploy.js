import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import FormData from 'form-data';
import archiver from 'archiver';
import dotenv from 'dotenv';
import { rimraf } from 'rimraf';
import * as mkdirp from 'mkdirp';

// Handle __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configure API client
const API_URL = (process.env.APP_URL || 'http://localhost:38444').replace(
  'https://',
  'http://'
);
const ACCESS_TOKEN = process.env.GODEPLOY_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('GODEPLOY_ACCESS_TOKEN is required in .env file');
  process.exit(1);
}

// Function to debug token issues
async function debugToken(token) {
  try {
    console.log('Debugging token validity...');
    // Extract token parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format: Token should have 3 parts');
      return false;
    }

    // Decode and log header and payload
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    console.log('Token header:', header);
    console.log('Token payload:');
    console.log('- Subject (sub):', payload.sub);
    console.log('- Issuer (iss):', payload.iss);
    console.log(
      '- Expires at:',
      payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'
    );
    console.log(
      '- Issued at:',
      payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'
    );

    // Check expiration
    if (payload.exp) {
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      if (expiresAt < now) {
        console.error(
          'Token is expired! Expired at:',
          new Date(expiresAt).toLocaleString()
        );
        return false;
      } else {
        console.log(
          'Token is valid and not expired. Expires in:',
          Math.round((expiresAt - now) / 1000 / 60),
          'minutes'
        );
      }
    } else {
      console.warn('Token does not have an expiration (exp) claim!');
    }

    return true;
  } catch (error) {
    console.error('Error parsing token:', error.message);
    return false;
  }
}

// Debug the token before using it
await debugToken(ACCESS_TOKEN);

// Create API client with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  },
});

// Project name will include timestamp to avoid collisions
const projectName = `test-project-${Date.now()}`;
const tempDir = path.join(__dirname, 'temp-deploy');
const zipFile = path.join(__dirname, `${projectName}.zip`);

async function createProject() {
  console.log(`Creating project: ${projectName}...`);

  try {
    const response = await api.post('/api/projects', {
      name: projectName,
      description: 'Test project created by script',
    });

    console.log('Project created successfully:');
    console.log(`- ID: ${response.data.id}`);
    console.log(`- Name: ${response.data.name}`);
    console.log(`- Subdomain: ${response.data.subdomain}`);
    console.log(`- URL: ${response.data.url}`);

    return response.data;
  } catch (error) {
    console.error('Failed to create project:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    console.error('Request config:', error.config);
    throw error;
  }
}

async function createTempHtmlFiles() {
  console.log('Creating temporary HTML files...');

  // Create temp directory
  await rimraf(tempDir);
  await mkdirp.mkdirp(tempDir);

  // Create a simple index.html file
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoDeploy Test</title>
  <style>
    body { 
      font-family: system-ui, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { color: #0070f3; }
    .container {
      border: 1px solid #eaeaea;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    }
    .success { color: #0070f3; font-weight: bold; }
    .timestamp { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>GoDeploy Test Deployment</h1>
    <p>If you're seeing this page, your deployment was <span class="success">successful!</span></p>
    <p>Project: <strong>${projectName}</strong></p>
    <p class="timestamp">Deployed at: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;

  fs.writeFileSync(path.join(tempDir, 'index.html'), html);
  console.log('HTML files created successfully');
}

async function createZipArchive() {
  console.log('Creating ZIP archive...');

  // Create a write stream for the zip file
  const output = fs.createWriteStream(zipFile);
  const archive = archiver('zip', { zlib: { level: 9 } });

  // Set up event listeners
  const archivePromise = new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
  });

  // Pipe archive data to the output file
  archive.pipe(output);

  // Add all files from temp directory
  archive.directory(tempDir, false);

  // Finalize the archive
  await archive.finalize();
  await archivePromise;

  console.log(`ZIP archive created at: ${zipFile}`);
}

async function deployProject(project) {
  console.log(`Deploying to project: ${projectName}...`);

  try {
    // Create form data
    const form = new FormData();
    form.append('archive', fs.createReadStream(zipFile));

    // Deploy the project
    const response = await api.post(
      `/api/deploy?project=${projectName}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    console.log('Deployment successful:');
    console.log(`- Success: ${response.data.success}`);
    console.log(`- URL: ${response.data.url}`);
    console.log('\nVisit the URL in your browser to see your deployed app!');

    return response.data;
  } catch (error) {
    console.error('Deployment failed:');
    console.error(error.response?.data || error.message);
    throw error;
  }
}

async function cleanup() {
  console.log('Cleaning up temporary files...');
  try {
    await rimraf(tempDir);
    fs.unlinkSync(zipFile);
    console.log('Cleanup complete');
  } catch (error) {
    console.warn('Failed to clean up some files:', error.message);
  }
}

async function checkServerRunning() {
  try {
    console.log(`Checking if the API server is running at ${API_URL}...`);
    await api.get('/health');
    console.log('API server is running');
    return true;
  } catch (error) {
    console.error('API server is not running or not accessible');
    console.error(`Please make sure the API server is running at ${API_URL}`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return false;
  }
}

async function main() {
  try {
    console.log('Starting test deployment process...');

    // Check if server is running
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
      console.error('Deployment aborted: API server is not running');
      // TODO: We could potentially start the server here with:
      // const { spawn } = require('child_process');
      // spawn('npm', ['run', 'dev'], { stdio: 'inherit', detached: true });
      // await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for server to start
      process.exit(1);
    }

    // Create a new project
    const project = await createProject();

    // Create HTML files
    await createTempHtmlFiles();

    // Create ZIP archive
    await createZipArchive();

    // Deploy the project
    const deployment = await deployProject(project);

    // Clean up
    await cleanup();

    console.log('\n========================================');
    console.log('Test deployment completed successfully!');
    console.log(`Visit: ${deployment.url}`);
    console.log('========================================\n');
  } catch (error) {
    console.error('Test deployment failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
