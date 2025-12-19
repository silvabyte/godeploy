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
│  PostgreSQL │  │  (S3)       │  │  (Hosting)      │
│  + Auth     │  │  Assets     │  │                 │
└─────────────┘  └──────┬──────┘  └─────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Nginx Proxy    │◄──── User requests to
              │  (Edge Router)  │      *.godeploy.app
              └─────────────────┘
```

## Request Flow for Deployed SPAs

```
User Browser
     │
     │  https://my-app--tenant.spa.godeploy.app
     ▼
┌─────────────────────────────────────────┐
│         Nginx Proxy Server              │
│  (godeploy-nginx-server on DO App)      │
│                                         │
│  1. Parse subdomain/custom domain       │
│  2. Route to correct CDN path           │
│  3. SPA fallback (index.html for 404s)  │
│  4. Cache responses                     │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│      DigitalOcean Spaces CDN            │
│  godeploy-spa-assets.nyc3.cdn.do.com    │
│                                         │
│  /spa-projects/{tenant}/{project}/      │
│  /spa-projects/{custom-domain}/         │
└─────────────────────────────────────────┘
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

### Nginx Proxy Server (`godeploy-nginx-server`)

> **Note:** This is a separate repository at `github.com/silvabyte/godeploy-nginx-server`

Nginx-based edge proxy that routes user requests to deployed SPAs:

- **Subdomain routing** - Routes `project--tenant.spa.godeploy.app` to correct CDN path
- **Custom domain routing** - Routes verified custom domains to their assets
- **Marketing site** - Serves `godeploy.app` and `www.godeploy.app`
- **SPA fallback** - Returns `index.html` for client-side routing (404 → index.html)
- **Caching** - Caches CDN responses at the edge

#### Server Blocks

| Block          | Domain Pattern                         | CDN Path                            |
| -------------- | -------------------------------------- | ----------------------------------- |
| Subdomains     | `{project}--{tenant}.spa.godeploy.app` | `/spa-projects/{tenant}/{project}/` |
| Marketing      | `godeploy.app`, `www.godeploy.app`     | `/spa-projects/godeploy.app/`       |
| Custom Domains | Any verified domain                    | `/spa-projects/{domain}/`           |

#### SPA Fallback Logic

```
1. Try exact path: /about → /spa-projects/.../about
2. Try .html extension: /about → /spa-projects/.../about.html
3. Fallback to index: /about → /spa-projects/.../index.html
```

This enables client-side routing frameworks (React Router, Vue Router, etc.) to work correctly.

## Data Flow

### Deploy Flow

```
1. CLI: godeploy deploy
   └─► Archive build directory (zip)
   └─► Upload to API /api/deploys

2. API: Receive upload
   └─► Validate JWT token
   └─► Store archive in DO Spaces
   └─► Extract files to /spa-projects/{tenant}/{project}/
   └─► Return deploy URL

3. User visits https://my-app--tenant.spa.godeploy.app
   └─► Request hits Nginx proxy
   └─► Nginx routes to DO Spaces CDN
   └─► CDN serves static files
   └─► SPA fallback handles client-side routes
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

| Service      | Purpose                                            |
| ------------ | -------------------------------------------------- |
| App Platform | Hosts API, dashboard, auth, marketing, nginx proxy |
| Spaces       | S3-compatible object storage for deploy assets     |
| Spaces CDN   | Edge caching for static assets                     |

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
