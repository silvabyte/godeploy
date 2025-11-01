# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoDeploy is a SPA deployment platform delivered as a monorepo. The system allows users to deploy static sites through a CLI, with backend API orchestrating deployments to DigitalOcean App Platform, and frontend dashboards for management.

**Tech Stack:**
- Runtime: Bun
- API: Fastify + TypeScript
- Frontend: React + Vite + TypeScript
- CLI: Go
- Database: Supabase (PostgreSQL)
- Storage: DigitalOcean Spaces (S3-compatible)
- Deployment Target: DigitalOcean App Platform
- Linting/Formatting: Biome
- Testing: Vitest

## Monorepo Structure

```
apps/
  api/          # Fastify REST API (TypeScript)
  auth/         # Authentication SPA (React + Vite)
  dashboard/    # Main dashboard SPA (React + Vite)
  marketing/    # Marketing site (React + Vite)
  cli/          # Go CLI tool
libs/
  testing/      # Shared testing utilities
supabase/       # Database migrations and config
```

## Common Commands

### Running the API (Development)
```bash
bun dev                    # Start API dev server with hot reload (default)
make api.dev               # Alternative via Makefile
```

### Testing
```bash
# Run all tests
bun test
make test-all

# Run specific app tests
bun run test:api           # API only
bun run test:auth          # Auth app only
bun run test:dashboard     # Dashboard only
make api.test              # API via Makefile

# Watch mode
bun run test:watch
make api.test.watch

# Coverage
bun run test:coverage
make api.test.coverage
```

### Linting & Formatting
```bash
# Lint
bun lint                   # Workspace-level
bun run lint:workspaces    # All apps
make api.lint              # API only

# Format
bun fmt                    # Format entire workspace
make api.fmt               # API only

# Check + fix (lint + format combined)
bun check:fix              # Fix workspace
make api.check.fix         # API only
```

### Type Checking
```bash
bun typecheck              # All TypeScript apps
make api.typecheck         # API only
```

### Database Operations
```bash
# Using bun scripts
bun db:new <name>          # Create migration
bun db:up                  # Apply migrations
bun db:push                # Push to remote
bun db:pull                # Pull from remote
bun db:reset               # Reset local DB

# Using Makefile
make db.new <name>
make db.up
make db.push
make db.pull
make db.reset
```

### Building
```bash
# Build all apps
make build-all

# Build specific apps
make api.build
make auth.build
make dashboard.build
make marketing.build
make cli.build
```

### Docker
```bash
bun docker:build           # Build API container
bun docker:run             # Run container
bun docker:start           # Build + run
```

### CLI Development (Go)
```bash
cd apps/cli
make test                  # Run tests
make build                 # Build for current platform
make build-all             # Build for all platforms
make lint                  # Run golangci-lint
make fmt                   # Format Go code
```

## Architecture

### API Structure

The API follows a component-based architecture:

```
apps/api/src/
  app/
    build/            # App initialization (build.ts, register.ts)
    components/       # Business logic components
      auth/           # Authentication (JWT, Supabase)
      db/             # Database service
      deploys/        # Deployment management
      projects/       # Project CRUD
      storage/        # File storage (S3), zip handling
      subscriptions/  # Subscription management
      metrics/        # Analytics
      digitalocean/   # DO App Platform integration
      services/       # BaseService for common patterns
    plugins/          # Fastify plugins
      db.ts           # Database plugin
      ratelimit.ts    # Rate limiting
      sensible.ts     # Error handling
      supabaseAuth.ts # Auth middleware
    routes/           # Route handlers
    utils/            # Utilities
  logging/            # Structured logging (ActionTelemetry)
  main.ts             # Entry point
```

**Key Patterns:**
- Services extend `BaseService` for common CRUD operations with pagination/filtering
- Fastify plugins registered in dependency order: sensible → supabaseAuth → db → ratelimit
- Routes use `config.auth: true` to require authentication
- Request decoration: `request.user` contains `{user_id, tenant_id}` after auth
- Telemetry decorators: `request.telemetry` (logging), `request.measure` (ActionTelemetry)

### Authentication Flow

1. User authenticates via `/auth/login` or `/auth/signup`
2. Supabase returns JWT tokens (access + refresh)
3. JWT stored in CLI or browser
4. Requests include `Authorization: Bearer <token>`
5. `supabaseAuth` plugin validates and decorates request with `user` object
6. Multi-tenant isolation via `tenant_id` in database queries

### Frontend Apps

All React apps follow similar structure:
- React Router v6+ with loaders/actions
- Vite for bundling
- TailwindCSS for styling
- TypeScript throughout
- See `apps/dashboard/CLAUDE.md` for detailed frontend conventions

### CLI Architecture

Go CLI (`apps/cli`) handles:
- User authentication (token management with XDG)
- Config file management (`godeploy.config.json`)
- Archive creation (zip SPA builds)
- Upload to API
- Uses Kong for command parsing

## Development Workflow

### Starting Local Development

1. Install dependencies: `bun install`
2. Set up environment: Copy `.env.example` to `.env` and configure
3. Start local Supabase (if needed): `supabase start`
4. Run migrations: `bun db:up`
5. Start API: `bun dev`
6. Start frontend: `cd apps/dashboard && bun dev`

### Adding a New Migration

```bash
bun db:new <migration_name>
# Edit the generated file in supabase/migrations/
bun db:up                  # Apply locally
bun db:push                # Push to remote (when ready)
```

### Environment Variables

Key variables (see `.env.example`):
- `SUPABASE_URL` / `SUPABASE_API_KEY`: Database connection
- `DIGITAL_OCEAN_TOKEN`: DO API authentication
- `DIGITAL_OCEAN_SPACES_*`: S3-compatible storage
- `HYPERDX_API_KEY`: Observability (optional)
- `NODE_ENV`: `development` | `production`
- `HOST` / `PORT`: Server binding (default: localhost:38444)

## Testing Conventions

- Test files: `*.spec.ts` or `*.test.ts`
- Use Vitest for TypeScript tests
- Use Go's `testing` package for CLI tests
- Mock Supabase client when needed
- Tests located alongside source files

## Important Notes

- **Port:** API runs on `38444` by default
- **Migrations:** Always in `supabase/migrations/`, named `<timestamp>_<name>.sql`
- **Multi-tenancy:** All user data scoped by `tenant_id`
- **Error Handling:** Use `@fastify/sensible` for HTTP errors, `await-to-js` for async/await
- **Logging:** Structured JSON logs via Pino, telemetry via HyperDX
- **Security:** Rate limiting enabled, auth required on most routes
- **File Uploads:** Handled via `@fastify/multipart`, stored in DO Spaces
- **Workspace Scripts:** Always run from repo root (not within app directories)

## Project Conventions

- No default exports in TypeScript
- Use `PascalCase` for components/interfaces, `camelCase` for functions/variables
- Co-locate types with usage
- Biome handles formatting and linting (not Prettier/ESLint)
- Commit messages follow Conventional Commits (enforced by commitlint)
