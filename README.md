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

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
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

## Documentation

API documentation is available at `/documentation` when the server is running.

## License

ISC
