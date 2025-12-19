# Architecture Overview

GoDeploy is a SPA deployment platform delivered as a monorepo. Users deploy static sites through a CLI, with a backend API orchestrating deployments to DigitalOcean App Platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              User Interfaces                                 │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   CLI (Go)      │  Dashboard      │   Auth App      │   Marketing Site      │
│   godeploy      │  React + Vite   │   React + Vite  │   Next.js             │
└────────┬────────┴────────┬────────┴────────┬────────┴───────────────────────┘
         │                 │                 │
         │                 ▼                 │
         │    ┌────────────────────────┐     │
         └───►│      REST API          │◄────┘
              │   Fastify + TypeScript │
              │      Port 38444        │
              └───────────┬────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
         ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
│  Supabase   │  │  DO Spaces  │  │  DO App Platform│
│  PostgreSQL │  │  (S3)       │  │  (CDN/Hosting)  │
│  + Auth     │  │  Assets     │  │  Static Sites   │
└─────────────┘  └─────────────┘  └─────────────────┘
```

## Components

### CLI (`apps/cli`)

Go-based command-line tool for developers:

- **Authentication** - Sign up, login, token management (XDG-compliant storage)
- **Project init** - Creates `godeploy.config.json` configuration
- **Deploy** - Archives build directory, uploads to API, triggers deployment
- **Git integration** - Auto-detects commit SHA, branch, message for deploy metadata

Key packages:

- `internal/api` - HTTP client for API communication
- `internal/auth` - Token management with automatic refresh
- `internal/config` - Configuration file parsing
- `internal/archive` - Zip creation for uploads

### API (`apps/api`)

Fastify REST API that orchestrates all backend operations:

- **Authentication** - JWT validation via Supabase, request decoration
- **Projects** - CRUD operations, subdomain management
- **Deploys** - File upload, storage, deployment triggering
- **Domains** - Custom domain configuration via DO App Platform
- **Storage** - S3-compatible file storage (DO Spaces)

Architecture patterns:

- **Plugin-based** - Fastify plugins for cross-cutting concerns
- **Service layer** - Business logic in component services
- **BaseService** - Abstract CRUD with pagination/filtering
- **Multi-tenant** - All data scoped by `tenant_id`

### Dashboard (`apps/dashboard`)

React SPA for project management:

- **Projects** - List, create, configure projects
- **Deploys** - View deployment history, stats, charts
- **Domains** - Custom domain management
- **Settings** - User preferences, team management

### Auth App (`apps/auth`)

Standalone authentication SPA:

- **Login/Signup** - Email/password authentication
- **Magic links** - Passwordless authentication
- **Password reset** - Self-service recovery

### Marketing (`apps/marketing`)

Next.js static site for public-facing content:

- Homepage, pricing, philosophy
- Terms of service, privacy policy

## Data Flow

### Deploy Flow

```
1. CLI: godeploy deploy
   └─► Archive build directory (zip)
   └─► Upload to API /api/deploys

2. API: Receive upload
   └─► Validate JWT token
   └─► Store archive in DO Spaces
   └─► Extract and process files
   └─► Configure CDN routing
   └─► Return deploy URL

3. CDN: Serve static files
   └─► https://project-name.godeploy.app
```

### Authentication Flow

```
1. User: Login via CLI or Dashboard
   └─► Credentials to Supabase Auth

2. Supabase: Validate credentials
   └─► Return JWT (access + refresh tokens)

3. Client: Store tokens
   └─► CLI: ~/.config/godeploy/config.json
   └─► Dashboard: Browser storage

4. API Request: Include Authorization header
   └─► Bearer <access_token>

5. API: Validate JWT
   └─► supabaseAuth plugin validates token
   └─► Decorates request with user context
   └─► RLS policies enforce tenant isolation
```

## Multi-Tenancy

GoDeploy uses a multi-tenant architecture with tenant isolation at the database level:

- **Tenants** - Organizations/accounts that own projects
- **Users** - Belong to one or more tenants via `tenant_users`
- **Projects** - Owned by a tenant, accessible to tenant members
- **Deploys** - Scoped to tenant via project ownership

Isolation is enforced via:

1. **RLS Policies** - PostgreSQL Row Level Security
2. **Service Role** - API uses service role with explicit tenant filtering
3. **Request Context** - `request.user.tenant_id` available after auth

## Infrastructure

### DigitalOcean Services

| Service      | Purpose                                        |
| ------------ | ---------------------------------------------- |
| App Platform | Hosts API, dashboard, auth, marketing          |
| Spaces       | S3-compatible object storage for deploy assets |
| CDN          | Edge caching for deployed SPAs                 |

### Supabase

| Feature    | Usage                           |
| ---------- | ------------------------------- |
| PostgreSQL | Primary database                |
| Auth       | User authentication, JWT tokens |
| RLS        | Row-level security policies     |
| Realtime   | (Future) Live deploy status     |

## Key Design Decisions

### Why Fastify?

- Performance-focused with low overhead
- Plugin architecture for modularity
- Built-in validation with JSON Schema
- TypeScript-first with excellent types

### Why Supabase?

- Managed PostgreSQL with built-in auth
- Row Level Security for multi-tenancy
- Real-time subscriptions (future use)
- Generous free tier for development

### Why DigitalOcean?

- Simple, predictable pricing
- App Platform handles SSL, scaling
- Spaces provides S3-compatible storage
- Good developer experience

### Why Go for CLI?

- Single binary distribution
- Fast startup time
- Cross-platform compilation
- No runtime dependencies

## Related Documentation

- [Database Schema](database-schema.md) - Tables, relationships, RLS
- [API Reference](../api/reference.md) - REST endpoints
- [Authentication](../api/authentication.md) - Auth flow details
