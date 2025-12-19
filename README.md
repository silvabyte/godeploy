# GoDeploy

A SPA deployment platform that makes deploying static sites dead simple. Upload your build, get a URL, done.

## Quick Start

### 1. Install the CLI

```bash
curl -sSL https://install.godeploy.app/now.sh | bash
```

### 2. Sign up and authenticate

```bash
godeploy auth sign-up    # Create an account
godeploy auth login      # Or sign in to existing account
```

### 3. Initialize your project

```bash
cd your-spa-project
godeploy init
```

This creates a `godeploy.config.json`:

```json
{
  "apps": [
    {
      "name": "my-app",
      "source_dir": "dist",
      "description": "My awesome SPA",
      "enabled": true
    }
  ]
}
```

### 4. Deploy

```bash
npm run build            # Build your SPA
godeploy deploy          # Deploy to GoDeploy
```

Your app is now live at `https://my-app.godeploy.app`

## Features

- **Instant deploys** - Upload your build, get a URL in seconds
- **Custom domains** - Bring your own domain with automatic SSL
- **Git integration** - Automatic commit metadata on deploys
- **Multi-app support** - Deploy multiple SPAs from one repo
- **Dashboard** - Manage projects, view deploy history, configure domains
- **CLI-first** - Everything you need from the command line

## Documentation

| Doc                                                     | Description                         |
| ------------------------------------------------------- | ----------------------------------- |
| [Architecture Overview](docs/architecture/overview.md)  | System design and components        |
| [Database Schema](docs/architecture/database-schema.md) | Tables, relationships, RLS policies |
| [API Reference](docs/api/reference.md)                  | REST API endpoints                  |
| [Authentication](docs/api/authentication.md)            | Auth flow and JWT tokens            |
| [CLI Usage](docs/guides/cli-usage.md)                   | Complete CLI reference              |
| [Custom Domains](docs/guides/custom-domains.md)         | Domain setup guide                  |
| [Development Setup](docs/development/setup.md)          | Local dev environment               |
| [Contributing](docs/development/contributing.md)        | How to contribute                   |

## Tech Stack

| Component | Technology                                      |
| --------- | ----------------------------------------------- |
| Runtime   | [Bun](https://bun.sh)                           |
| API       | [Fastify](https://fastify.io) + TypeScript      |
| Frontend  | React + [Vite](https://vitejs.dev) + TypeScript |
| CLI       | Go                                              |
| Database  | [Supabase](https://supabase.com) (PostgreSQL)   |
| Storage   | DigitalOcean Spaces (S3-compatible)             |
| Hosting   | DigitalOcean App Platform                       |

## Monorepo Structure

```
apps/
  api/          # Fastify REST API
  auth/         # Authentication SPA
  dashboard/    # Management dashboard
  marketing/    # Marketing site (Next.js)
  cli/          # Go CLI tool
libs/
  testing/      # Shared test utilities
supabase/       # Database migrations
```

### Related Repositories

| Repository                                                                  | Description                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| [godeploy-nginx-server](https://github.com/silvabyte/godeploy-nginx-server) | Nginx edge proxy for routing requests to deployed SPAs |

## Development

```bash
# Install dependencies
bun install

# Start the API (default)
bun dev

# Run tests
bun test

# Lint & format
make all.check.fix

# Type check
make all.typecheck
```

See [Development Setup](docs/development/setup.md) for full instructions.

## License

[MIT](LICENSE.md)
