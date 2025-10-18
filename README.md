# GoDeploy API 🚀

> Ship static sites instantly. No configs. No complexity. Just deploy.

The backend that powers [GoDeploy](https://godeploy.app) - dead simple static site hosting for indie hackers who'd rather ship than configure infrastructure.

## What This Does

GoDeploy API handles the boring parts of static hosting so you don't have to:

- **Instant deploys** via CLI - `godeploy deploy` and you're live
- **Automatic subdomains** - myapp.godeploy.app ready in seconds  
- **Global CDN** - DigitalOcean's edge network built-in
- **Zero config** - Works out of the box with any static site

## Quick Start

```bash
# Clone and install
git clone https://github.com/silvabyte/godeploy-api
cd godeploy-api
bun install

# Configure (you'll need Supabase + DigitalOcean accounts)
cp .env.example .env
# Add your credentials to .env

# Run it
bun dev
```

That's it. API runs on `http://localhost:3000`.

## Tech Stack

Built with boring, reliable tech that just works:

- **Bun** - Fast runtime, great DX
- **Fastify** - Handles traffic spikes without breaking a sweat
- **Supabase** - Auth + PostgreSQL that scales
- **DigitalOcean Spaces** - S3-compatible storage that's actually affordable
- **Biome** - One tool for formatting/linting (bye Prettier + ESLint)

## Monorepo Layout

- `apps/api` - Fastify service powering the GoDeploy API
- `apps/auth` - Vite SPA that powers the GoDeploy auth experience
- `apps/dashboard` - Vite dashboard used after sign-in
- `apps/marketing` - Next.js marketing site
- `apps/cli` - Go-based CLI distributed as `godeploy`
- `libs/*` - Shared packages live here

## Core Endpoints

### Deploy a Site
```bash
POST /api/deploy?project=my-app
```
Upload a zip, get a URL. That simple.

### Create Project
```bash
POST /api/projects
{ "name": "my-app" }
```

### List Projects
```bash
GET /api/projects
```

### Auth Flow (for CLI)
```bash
POST /api/auth/init
{ "email": "you@example.com" }
```
Sends magic link → User clicks → CLI gets token → Done.

## Docs

- Custom domains: see `docs/CUSTOM_DOMAINS.md`
- Metrics pages: see `docs/METRICS_PAGES.md`

## Local Development

```bash
bun dev               # Start API with hot reload (see package.json for app-specific dev scripts)
bun fmt               # Format the whole workspace with Biome
bun lint              # Lint everything via Biome
bun check             # Lint + format check
bun typecheck         # Run TypeScript checks across all TS workspaces

# Workspace helpers (run per app when you need finer control)
bun fmt:workspaces    # Call each package-level fmt script
bun lint:workspaces   # Call each package-level lint script
```

## Database

Using Supabase? Migrations are in `supabase/migrations/`:

```bash
bun db:new      # Create migration
bun db:up       # Apply locally
bun db:push     # Push to Supabase
```

## Testing

```bash
# Run the test suite
bun test

# Test the API endpoints
./scripts/test-api.sh
```

## Environment Variables

```env
# Required
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_API_KEY=your-anon-key
DIGITAL_OCEAN_SPACES_KEY=your-key
DIGITAL_OCEAN_SPACES_SECRET=your-secret

# Optional (for testing)
GODEPLOY_ACCESS_TOKEN=test-jwt-token
```

## Docker

```bash
docker build -t godeploy-api .
docker run -p 3000:3000 --env-file .env godeploy-api
```

## Why This Exists

Because deploying a static site shouldn't require:
- Learning Kubernetes
- Writing YAML configs
- Setting up CI/CD pipelines
- Reading 50 pages of docs

Just `godeploy deploy` and move on with your life.

## Contributing

Found a bug? Got an idea? PRs welcome. 

Keep it simple. If a feature needs a paragraph to explain, it probably doesn't belong here.

## License

ISC - Use it however you want.

---

Built by [@matsilva](https://github.com/matsilva) - [X](https://x.com/matsilva) - [silvabyte.com](https://silvabyte.com)

Part of the indie hacker toolkit. Ship fast, iterate faster.
