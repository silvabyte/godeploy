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

### Deploy Endpoint

```
POST /api/deploy?project=<project-name>
```

Uploads a static SPA to DigitalOcean Spaces and returns a CDN URL.

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
```

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or use the start script
./scripts/start.sh
```

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
./scripts/run-migrations.sh

# Or run the migrations manually
npm run db:migrate:push

# Initialize test data
supabase db query < scripts/init-test-data.sql
```

## Testing the API

For testing purposes, the API includes public endpoints that don't require authentication:

- `GET /health` - Health check endpoint
- `GET /api/projects-public` - List all projects for the test tenant
- `POST /api/deploy-public?project=<project-name>` - Deploy a SPA to the test tenant

### Example: Deploy a SPA

```bash
curl -X POST \
  -F "archive=@/path/to/spa.zip" \
  -F "spa_config=@/path/to/spa-config.json" \
  "http://localhost:3000/api/deploy-public?project=my-app"
```

### Example: List Projects

```bash
curl "http://localhost:3000/api/projects-public"
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
