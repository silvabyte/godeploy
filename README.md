# GoDeploy API

Backend API for GoDeploy, a service that lets users deploy static SPAs to DigitalOcean Spaces + CDN via CLI.

## Features

- Deploy static SPAs to DigitalOcean Spaces + CDN
- Multi-tenant architecture with Supabase Auth
- Automatic subdomain provisioning
- Project management
- Deploy history tracking

## Tech Stack

- Fastify (Node.js)
- Supabase (Auth & Database)
- DigitalOcean Spaces (Storage)
- DigitalOcean CDN (Content Delivery)

## API Endpoints

### Authentication

All API endpoints require authentication via Supabase JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

#### CLI Authentication Flow

The API supports a magic link authentication flow for CLI clients using Supabase OTP:

1. **Initialize Authentication**

```
POST /api/auth/init
```

Initiates the authentication flow by sending a magic link to the user's email using Supabase OTP.

**Request:**

```json
{
  "email": "user@example.com",
  "redirect_uri": "http://localhost:38389/callback"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Check your email for the login link."
}
```

2. **Magic Link Flow**

When the user clicks the magic link in their email, Supabase will handle the authentication and redirect to the CLI's callback URL with an access token.

3. **Verify Token**

```
GET /api/auth/verify
```

Verifies if a token is valid and returns the user information.

**Response:**

```json
{
  "valid": true,
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "tenant_id": "tenant-id"
  }
}
```

### Projects Endpoint

```
GET /api/projects
```

Returns a list of all projects for the authenticated tenant.

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "my-app",
    "subdomain": "my-app",
    "url": "https://my-app.godeploy.app",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
]
```

### Create Project Endpoint

```
POST /api/projects
```

Creates a new project for the authenticated tenant.

**Request:**

```json
{
  "name": "my-app",
  "description": "My awesome SPA application"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "my-app",
  "subdomain": "my-app",
  "description": "My awesome SPA application",
  "url": "https://my-app.godeploy.app",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Deploy Endpoint

```
POST /api/deploy?project=<project-name>
```

Uploads a static SPA to DigitalOcean Spaces and returns a CDN URL.

**Note:** The project must exist before deploying. If the project doesn't exist, you'll need to create it first using the Create Project endpoint.

**Request:**

- Multipart form data with:
  - `archive`: Zipped SPA build directory
  - `spa_config`: Configuration file (optional)

**Response:**

```json
{
  "success": true,
  "url": "https://my-app.godeploy.app"
}
```

## Development

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- DigitalOcean account with Spaces enabled

### Environment Variables

Create a `.env` file with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_API_KEY=your_supabase_api_key
DIGITAL_OCEAN_SPACES_KEY=your_spaces_access_key
DIGITAL_OCEAN_SPACES_SECRET=your_spaces_secret_key
GODEPLOY_ACCESS_TOKEN="your_supabase_jwt_token"
```

The `GODEPLOY_ACCESS_TOKEN` is a long-lived JWT token from Supabase that can be used for testing the API with a real authenticated user.

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing the API

```bash
# Test the API with the test script
./scripts/test-api.sh
```

The test script will:

1. Check if the server is running
2. Test the health endpoint
3. Test the projects endpoint with auth token
4. Test creating a new project
5. Test the deploy endpoint with auth token
6. Test deploying to a non-existent project
7. Clean up test files

### Database Migrations

```bash
# Create a new migration
npm run db:migrate:new

# Apply migrations
npm run db:migrate:up

# Push migrations to Supabase
npm run db:migrate:push
```

## Database Setup

```bash
# Run the migrations
npm run db:migrate:push

# Initialize test data
supabase db query < scripts/init-test-data.sql
```

### Example: Create a Project

```bash
curl -X POST \
  -H "Authorization: Bearer $GODEPLOY_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"my-app", "description":"My awesome SPA application"}' \
  "http://localhost:3000/api/projects"
```

### Example: Deploy a SPA

```bash
curl -X POST \
  -H "Authorization: Bearer $GODEPLOY_ACCESS_TOKEN" \
  -F "archive=@/path/to/spa.zip" \
  -F "spa_config=@/path/to/spa-config.json" \
  "http://localhost:3000/api/deploy?project=my-app"
```

### Example: List Projects

```bash
curl -H "Authorization: Bearer $GODEPLOY_ACCESS_TOKEN" \
  "http://localhost:3000/api/projects"
```

## Documentation

API documentation is available at `/documentation` when the server is running.

## License

ISC

## Running with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run the Docker image directly
docker build -t godeploy-api .
docker run -p 3000:3000 --env-file .env godeploy-api
```
