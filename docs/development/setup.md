# Development Setup

This guide covers setting up a local development environment for GoDeploy.

## Prerequisites

- **Node.js** 20+ (see `.nvmrc`)
- **Bun** 1.0+ (runtime and package manager)
- **Go** 1.21+ (for CLI development)
- **Docker** (for local Supabase)
- **Make** (for build commands)

### Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

### Install Go

```bash
# macOS
brew install go

# Linux
sudo apt install golang-go
```

## Quick Start

```bash
# Clone the repository
git clone https://github.com/silvabyte/godeploy-api.git
cd godeploy-api

# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Start local Supabase
supabase start

# Apply database migrations
bun db:up

# Start the API
bun dev
```

The API is now running at `http://localhost:38444`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database (from supabase start output)
SUPABASE_URL=http://localhost:54321
SUPABASE_API_KEY=your-local-anon-key

# DigitalOcean (optional for local dev)
DIGITAL_OCEAN_TOKEN=
DIGITAL_OCEAN_SPACES_KEY=
DIGITAL_OCEAN_SPACES_SECRET=
DIGITAL_OCEAN_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
DIGITAL_OCEAN_SPACES_BUCKET=godeploy-spa-assets

# Server
HOST=localhost
PORT=38444
NODE_ENV=development

# Observability (optional)
HYPERDX_API_KEY=
```

### Getting Supabase Keys

After running `supabase start`, you'll see output like:

```
API URL: http://localhost:54321
anon key: eyJ...
service_role key: eyJ...
```

Use the `anon key` for `SUPABASE_API_KEY`.

## Database

### Local Supabase

```bash
# Start Supabase (PostgreSQL, Auth, etc.)
supabase start

# Stop Supabase
supabase stop

# View Supabase status
supabase status
```

Access the local Supabase Studio at `http://localhost:54323`

### Migrations

```bash
# Apply pending migrations
bun db:up

# Create a new migration
bun db:new add_feature_table

# Reset database (drops all data)
bun db:reset

# Pull schema from remote
bun db:pull

# Push to remote database
bun db:push
```

## Running the Apps

### API

```bash
# Development with hot reload
bun dev

# Or via Makefile
make api.dev
```

### Dashboard

```bash
cd apps/dashboard
bun dev
```

### Auth App

```bash
cd apps/auth
bun dev
```

### Marketing Site

```bash
cd apps/marketing
bun dev
```

### CLI

```bash
cd apps/cli

# Build
make cli.build

# Run locally
./out/godeploy --help
```

## Testing

### Run All Tests

```bash
bun test

# Or via Makefile
make all.test
```

### Run Specific App Tests

```bash
# API tests
bun run test:api
make api.test

# Dashboard tests
bun run test:dashboard

# Auth tests
bun run test:auth
```

### Watch Mode

```bash
bun run test:watch
make api.test.watch
```

### Coverage

```bash
bun run test:coverage
make api.test.coverage
```

## Linting & Formatting

GoDeploy uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Lint all files
make all.lint

# Format all files
make all.fmt

# Check (lint + format) and fix
make all.check.fix

# App-specific
make api.lint
make api.fmt
make api.check.fix
```

## Type Checking

```bash
# All TypeScript apps
make all.typecheck

# API only
make api.typecheck
```

## Building

```bash
# Build all apps
make all.build

# Build specific apps
make api.build
make auth.build
make dashboard.build
make marketing.build
make cli.build
```

## Docker

### Build API Container

```bash
bun docker:build
```

### Run Container

```bash
bun docker:run
```

### Build and Run

```bash
bun docker:start
```

## CLI Development

### Build for Current Platform

```bash
cd apps/cli
make cli.build
# Output: out/godeploy
```

### Build for All Platforms

```bash
make cli.build.all
# Output: dist/godeploy-{platform}-{arch}.tar.gz
```

### Run Tests

```bash
make cli.test
make cli.test.coverage
```

### Lint Go Code

```bash
make cli.lint
make cli.fmt
```

## Project Structure

```
.
├── apps/
│   ├── api/           # Fastify REST API
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── build/       # App initialization
│   │   │   │   ├── components/  # Business logic
│   │   │   │   ├── plugins/     # Fastify plugins
│   │   │   │   ├── routes/      # Route handlers
│   │   │   │   └── utils/       # Utilities
│   │   │   ├── logging/         # Telemetry
│   │   │   └── main.ts          # Entry point
│   │   └── tests/               # Vitest tests
│   ├── auth/          # Auth SPA
│   ├── dashboard/     # Dashboard SPA
│   ├── marketing/     # Marketing site
│   └── cli/           # Go CLI
│       ├── cmd/godeploy/        # Main command
│       └── internal/            # Internal packages
├── libs/
│   └── testing/       # Shared test utilities
├── supabase/
│   └── migrations/    # Database migrations
├── docs/              # Documentation
└── makefiles/         # Make includes
```

## Common Tasks

### Add a New API Route

1. Create route file in `apps/api/src/app/routes/`
2. Register in `apps/api/src/app/build/register.ts`
3. Add tests in `apps/api/tests/`

### Add a New Database Table

1. Create migration: `bun db:new create_table_name`
2. Edit migration file in `supabase/migrations/`
3. Apply: `bun db:up`
4. Add RLS policies if needed

### Add a New CLI Command

1. Add command in `apps/cli/cmd/godeploy/godeploy.go`
2. Implement in `apps/cli/internal/`
3. Add tests

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 38444
lsof -i :38444

# Kill it
kill -9 <PID>
```

### Supabase Won't Start

```bash
# Reset Docker containers
supabase stop --no-backup
docker system prune
supabase start
```

### Bun Install Fails

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### Database Connection Issues

1. Verify Supabase is running: `supabase status`
2. Check `.env` has correct `SUPABASE_URL`
3. Ensure migrations are applied: `bun db:up`

## Related Documentation

- [Contributing](contributing.md) - Contribution guidelines
- [Architecture Overview](../architecture/overview.md) - System design
- [Database Schema](../architecture/database-schema.md) - Tables and migrations
