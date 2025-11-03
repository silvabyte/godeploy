# GoDeploy Feature Implementation Tracking

**Last Updated:** 2025-11-03
**Status:** Planning Phase - All features stubbed and ready for implementation

## Overview

This document tracks the implementation status of all planned GoDeploy CLI and API features. All features have been stubbed with placeholder implementations that return "Not implemented yet" messages.

## Implementation Status Key

- 🟢 **Implemented** - Feature is fully implemented and tested
- 🟡 **In Progress** - Feature is currently being worked on
- 🔴 **Stubbed** - Placeholder exists, not yet implemented
- ⚪ **Planned** - Not yet stubbed

---

## Priority 1: Core Project Management

### Essential features for any deployment platform

| Feature | CLI Status | API Status | Notes |
|---------|-----------|-----------|-------|
| **List Projects** | 🔴 Stubbed | 🟢 Implemented | API endpoint exists at `GET /api/projects` |
| **Project Status** | 🔴 Stubbed | 🔴 Stubbed | Show deployment state, last deploy info, URL |
| **Deployment Logs** | 🔴 Stubbed | 🔴 Stubbed | Stream logs, tail mode, filter by deployment ID |
| **Deployment History** | 🔴 Stubbed | 🔴 Stubbed | List past deployments with metadata |
| **Whoami** | 🔴 Stubbed | 🔴 Stubbed | Show user email, tenant ID, subscription |

#### CLI Commands
- `godeploy projects [--filter=all|enabled|disabled] [--json]`
- `godeploy status <project>`
- `godeploy logs <project> [--follow] [--lines N] [--deployment-id ID]`
- `godeploy deployments <project> [--limit N] [--json]`
- `godeploy whoami [--json]`

#### API Endpoints
- `GET /api/projects` - ✅ Already implemented
- `GET /api/projects/:projectId/status` - ❌ Stub at projects.ts:304
- `GET /api/projects/:projectId/logs` - ❌ Stub at projects.ts:332
- `GET /api/projects/:projectId/deployments` - ❌ Stub at projects.ts:318
- `GET /api/auth/whoami` - ❌ Stub at auth.ts:451

#### Implementation Notes
- Project listing already works via existing API
- Need to design deployment log storage strategy
- Consider log streaming implementation (WebSocket vs SSE vs polling)

---

## Priority 2: Deployment Operations

### High-value features for managing deployments

| Feature | CLI Status | API Status | Notes |
|---------|-----------|-----------|-------|
| **Rollback** | 🔴 Stubbed | 🔴 Stubbed | Rollback to previous deployment |
| **Delete Project** | 🔴 Stubbed | 🔴 Stubbed | Remove project with confirmation |
| **Open Project** | 🔴 Stubbed | N/A | Client-side only (open browser) |
| **Deploy Dry Run** | 🔴 Stubbed | N/A | Preview without deploying |
| **Validate Config** | 🔴 Stubbed | N/A | Local validation |

#### CLI Commands
- `godeploy rollback <project> [--deployment-id ID] [--force]`
- `godeploy delete <project> [--force]`
- `godeploy open <project> [--dashboard]`
- `godeploy deploy --dry-run` - Added to existing deploy command
- `godeploy deploy --wait [--timeout 10m]` - Added to existing deploy command
- `godeploy deploy --json` - Added to existing deploy command
- `godeploy validate [--verbose]`

#### API Endpoints
- `POST /api/projects/:projectId/rollback` - ❌ Stub at projects.ts:348
- `DELETE /api/projects/:projectId` - ❌ Stub at projects.ts:362
- `GET /api/projects/:projectId/diff` - ❌ Stub at projects.ts:376

#### Implementation Notes
- Rollback needs deployment version tracking
- Delete should cascade properly (deployments, domains, etc.)
- Open command can be implemented immediately (client-side only)
- Dry run can use existing archive creation without upload
- Validate can check config + verify source dirs exist

---

## Priority 3: Developer Experience

### Quality of life improvements

| Feature | CLI Status | API Status | Notes |
|---------|-----------|-----------|-------|
| **Link Project** | 🔴 Stubbed | N/A | Associate local dir with remote project |
| **Preview Deployment** | 🔴 Stubbed | 🔴 Stubbed | Temporary deployment with auto-cleanup |
| **Diff Local vs Deployed** | 🔴 Stubbed | 🔴 Stubbed | Show file/size changes |

#### CLI Commands
- `godeploy link <project>`
- `godeploy preview [--name NAME] [--ttl 7d]`
- `godeploy diff <project>`

#### API Endpoints
- `POST /api/deploys/preview` - ❌ Stub at deploys.ts:330
- `GET /api/projects/:projectId/diff` - ❌ Stub at projects.ts:376

#### Implementation Notes
- Link can store project name in local `.godeploy` file
- Preview deployments need TTL mechanism and cleanup job
- Diff requires storing deployment manifests (file list + hashes)

---

## Priority 4: Environment & Configuration

### Environment variable and CLI configuration management

| Feature | CLI Status | API Status | Notes |
|---------|-----------|-----------|-------|
| **Environment Variables** | 🔴 Stubbed | 🔴 Stubbed | Manage project env vars |
| **CLI Configuration** | 🔴 Stubbed | N/A | Local CLI settings |

#### CLI Commands
- `godeploy env list <project>`
- `godeploy env set <project> <KEY> <VALUE>`
- `godeploy env unset <project> <KEY>`
- `godeploy env pull <project> [--output .env]`
- `godeploy cli-config get <key>`
- `godeploy cli-config set <key> <value>`
- `godeploy cli-config list`
- `godeploy cli-config api-url <url>`

#### API Endpoints
- `GET /api/projects/:projectId/env` - ❌ Stub at env.ts:7
- `POST /api/projects/:projectId/env` - ❌ Stub at env.ts:19
- `GET /api/projects/:projectId/env/:key` - ❌ Stub at env.ts:31
- `DELETE /api/projects/:projectId/env/:key` - ❌ Stub at env.ts:43

#### Implementation Notes
- Env vars should be encrypted at rest
- Need new `project_env_vars` table
- CLI config stored in `~/.config/godeploy/config.toml` (XDG compliant)
- Consider injecting env vars into deployment process

---

## Priority 5: Domain & URL Management

### Custom domain and alias features

| Feature | CLI Status | API Status | Notes |
|---------|-----------|-----------|-------|
| **Custom Domains** | 🔴 Stubbed | 🟢 Partial | Domain management exists, needs full CRUD |
| **URL Aliases** | 🔴 Stubbed | 🔴 Stubbed | Short/memorable URLs |

#### CLI Commands
- `godeploy domains list <project>`
- `godeploy domains add <project> <domain>`
- `godeploy domains remove <project> <domain>`
- `godeploy domains verify <domain>`
- `godeploy aliases list <project>`
- `godeploy aliases create <project> <alias>`
- `godeploy aliases remove <project> <alias>`

#### API Endpoints
- Domains partially implemented in `domains.ts` and `projects.ts`
- `GET /api/projects/:projectId/aliases` - ❌ Stub at projects.ts:392
- `POST /api/projects/:projectId/aliases` - ❌ Stub at projects.ts:406
- `DELETE /api/projects/:projectId/aliases/:alias` - ❌ Stub at projects.ts:420

#### Implementation Notes
- Domain verification already exists
- Need to complete domain CRUD operations
- Aliases need new `project_aliases` table
- Consider alias uniqueness constraints

---

## Priority 6: Analytics & Monitoring

### Metrics and health checking

| Feature | CLI Status | API Status | Notes |
|---------|-----------|-----------|-------|
| **Project Metrics** | 🔴 Stubbed | 🔴 Stubbed | Request count, bandwidth, errors |
| **Analytics Dashboard** | 🔴 Stubbed | 🔴 Stubbed | Link to web analytics |
| **Health Check** | 🔴 Stubbed | 🔴 Stubbed | Ping, CDN status, SSL check |

#### CLI Commands
- `godeploy metrics <project> [--period 7d] [--json]`
- `godeploy analytics <project>`
- `godeploy health <project> [--verbose]`

#### API Endpoints
- `GET /api/projects/:projectId/metrics` - ❌ Stub at projects.ts:438
- `GET /api/projects/:projectId/analytics` - ❌ Stub at analytics.ts:7
- `GET /api/projects/:projectId/analytics/data` - ❌ Stub at analytics.ts:19
- `GET /api/projects/:projectId/health` - ❌ Stub at projects.ts:452

#### Implementation Notes
- Metrics may require CDN integration (DigitalOcean Spaces/CDN analytics)
- Some metrics already exist in `metrics.ts` and `metrics.pages.ts`
- Health check can ping deployment URL, check DNS, verify SSL cert
- Consider integrating with existing HyperDX telemetry

---

## Priority 7: Team & Collaboration

### Multi-user and team features

| Feature | CLI Status | API Status | Notes |
|---------|-----------|-----------|-------|
| **Team Management** | 🔴 Stubbed | 🔴 Stubbed | Create teams, invite members |
| **API Tokens** | 🔴 Stubbed | 🔴 Stubbed | For CI/CD authentication |

#### CLI Commands
- `godeploy teams list`
- `godeploy teams switch <team>`
- `godeploy teams create <name>`
- `godeploy teams invite <email>`
- `godeploy tokens list`
- `godeploy tokens create [--name NAME] [--expires 90d]`
- `godeploy tokens revoke <id>`

#### API Endpoints
- `GET /api/teams` - ❌ Stub at teams.ts:7
- `POST /api/teams` - ❌ Stub at teams.ts:19
- `GET /api/teams/:teamId` - ❌ Stub at teams.ts:31
- `PATCH /api/teams/:teamId` - ❌ Stub at teams.ts:43
- `DELETE /api/teams/:teamId` - ❌ Stub at teams.ts:55
- `GET /api/teams/:teamId/members` - ❌ Stub at teams.ts:67
- `POST /api/teams/:teamId/members` - ❌ Stub at teams.ts:79
- `DELETE /api/teams/:teamId/members/:userId` - ❌ Stub at teams.ts:91
- `GET /api/tokens` - ❌ Stub at tokens.ts:7
- `POST /api/tokens` - ❌ Stub at tokens.ts:19
- `GET /api/tokens/:tokenId` - ❌ Stub at tokens.ts:31
- `DELETE /api/tokens/:tokenId` - ❌ Stub at tokens.ts:43
- `PATCH /api/tokens/:tokenId` - ❌ Stub at tokens.ts:55

#### Implementation Notes
- Teams require new database schema (teams, team_members, team_projects)
- Current tenant system may need refactoring to support teams
- API tokens need separate auth flow from user tokens
- Consider token scoping (read-only, deploy-only, admin)

---

## Priority 8: Advanced Features

### Power user and advanced workflow features

| Feature | CLI Status | API Status | Notes |
|---------|-----------|-----------|-------|
| **Promote Deployment** | 🔴 Stubbed | 🔴 Stubbed | Copy deployment between projects |
| **Compare Deployments** | 🔴 Stubbed | 🔴 Stubbed | Show differences between two deploys |
| **Cache Management** | 🔴 Stubbed | 🔴 Stubbed | Clear/purge CDN cache |
| **Build Configuration** | 🔴 Stubbed | 🔴 Stubbed | Auto-detect and run builds |

#### CLI Commands
- `godeploy promote <source> <target> [--force]`
- `godeploy compare <deployment-a> <deployment-b>`
- `godeploy cache clear <project>`
- `godeploy cache purge <project> <path>`
- `godeploy cache stats <project>`
- `godeploy builds run [--build-cmd CMD]`
- `godeploy builds config [--command CMD]`

#### API Endpoints
- `POST /api/projects/:sourceId/promote/:targetId` - ❌ Stub at projects.ts:468
- `GET /api/deploys/compare` - ❌ Stub at deploys.ts:343
- `POST /api/projects/:projectId/cache/clear` - ❌ Stub at cache.ts:7
- `POST /api/projects/:projectId/cache/purge` - ❌ Stub at cache.ts:19
- `GET /api/projects/:projectId/cache/stats` - ❌ Stub at cache.ts:31
- `GET /api/projects/:projectId/builds/config` - ❌ Stub at builds.ts:7
- `POST /api/projects/:projectId/builds/config` - ❌ Stub at builds.ts:19
- `POST /api/projects/:projectId/builds/run` - ❌ Stub at builds.ts:31
- `GET /api/projects/:projectId/builds/history` - ❌ Stub at builds.ts:43
- `GET /api/projects/:projectId/builds/:buildId/logs` - ❌ Stub at builds.ts:55

#### Implementation Notes
- Promote can copy deployment assets between projects
- Compare needs deployment manifest storage
- Cache clearing already partially implemented (--clear-cache flag exists)
- Build system could detect framework (React/Vue/etc) and run appropriate commands

---

## Implementation Recommendations

### Quick Wins (Can be implemented immediately)
1. **Open Command** - Client-side only, just opens URL in browser
2. **Validate Command** - Local config validation + directory checks
3. **CLI Config** - Simple TOML file read/write operations
4. **Whoami** - Simple database query for user info
5. **Link Command** - Write project name to local `.godeploy` file

### High Priority (Should implement next)
1. **Project Status** - Essential for users to check deployment state
2. **Deployment History** - Already have deploys table, just need endpoint
3. **Delete Project** - Important for cleanup, ensure cascade deletes
4. **Rollback** - Critical for production use
5. **Environment Variables** - Required for many apps

### Medium Priority (Can wait)
1. Preview Deployments
2. Diff functionality
3. Metrics/Analytics integration
4. Health checks
5. Domain management improvements

### Low Priority (Nice to have)
1. Teams (unless targeting enterprise)
2. API Tokens (unless targeting CI/CD heavily)
3. Build automation
4. Advanced cache management
5. Promote/Compare features

---

## Database Schema Requirements

### New Tables Needed

```sql
-- Environment Variables
CREATE TABLE project_env_vars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL, -- encrypted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, key)
);

-- URL Aliases
CREATE TABLE project_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  alias TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- API Tokens
CREATE TABLE api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- Build Configuration
CREATE TABLE project_build_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  build_command TEXT,
  output_directory TEXT DEFAULT 'dist',
  node_version TEXT,
  framework TEXT, -- react, vue, angular, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Deployment Manifests (for diff/compare)
CREATE TABLE deployment_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id UUID NOT NULL REFERENCES deploys(id) ON DELETE CASCADE,
  files JSONB NOT NULL, -- [{path, size, hash}]
  total_size BIGINT NOT NULL,
  file_count INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams (if implementing Priority 7)
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE team_projects (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, project_id)
);
```

---

## Testing Checklist

### Before marking any feature as "Implemented"

- [ ] Unit tests written for business logic
- [ ] Integration tests for API endpoints
- [ ] CLI command tested manually
- [ ] Error handling tested (invalid input, auth failures, etc.)
- [ ] Documentation updated (README, CLAUDE.md)
- [ ] Migration created (if database changes)
- [ ] API route schema defined (Fastify validation)
- [ ] TypeScript types defined
- [ ] Telemetry/logging added
- [ ] Rate limiting considered
- [ ] Multi-tenancy tested (can't access other tenant's data)

---

## Files Modified

### CLI
- `apps/cli/cmd/godeploy/godeploy.go` - All command structures and stubs

### API
- `apps/api/src/app/routes/projects.ts` - Extended with stubs
- `apps/api/src/app/routes/deploys.ts` - Extended with stubs
- `apps/api/src/app/routes/auth.ts` - Extended with whoami
- `apps/api/src/app/routes/env.ts` - New file (environment variables)
- `apps/api/src/app/routes/teams.ts` - New file (team management)
- `apps/api/src/app/routes/tokens.ts` - New file (API tokens)
- `apps/api/src/app/routes/cache.ts` - New file (cache management)
- `apps/api/src/app/routes/analytics.ts` - New file (analytics)
- `apps/api/src/app/routes/builds.ts` - New file (build configuration)
- `apps/api/src/app/build/register.ts` - Registered all new routes

---

## Next Steps

1. **Choose a feature to implement** from Quick Wins or High Priority
2. **Create a branch**: `feature/<feature-name>`
3. **Implement** CLI + API together
4. **Test thoroughly** (see Testing Checklist)
5. **Update this document** - Change status from 🔴 to 🟡 (in progress) to 🟢 (implemented)
6. **Create PR** with clear description and testing instructions

---

## Notes

- All stub commands return helpful messages explaining what they will do
- All stub API endpoints return 501 (Not Implemented) status
- CLI builds successfully: `make cli.build`
- API type-checks pass: `make api.typecheck`
- Ready for feature-by-feature implementation starting with Quick Wins
