# Bun Migration Plan for GoDeploy API

## Current State Analysis

- **Bun Version**: 1.2.19 installed
- **Lock File**: `bun.lock` created (210KB vs 376KB package-lock.json)
- **Dependencies**: All packages installed via bun
- **Current Runtime**: Node.js with tsx for TypeScript execution

## Migration Tasks

### 1. ✅ Completed

- [x] `bun init` executed
- [x] `bun install` completed successfully
- [x] `bun.lock` file generated

### 2. 🚨 CRITICAL: Replace Fastify Autoload

**Issue**: `@fastify/autoload` does not work with Bun due to module resolution differences.

**Current Structure**:

```typescript
// src/app/build/autoload.ts uses AutoLoad
fastify.register(AutoLoad, {
  dir: join(srcDir, 'plugins'),
  options: { ...opts },
});
```

**Solution**: Create explicit registration file with manual imports.

#### New file: `src/app/build/register.ts`

```typescript
import type { FastifyInstance } from 'fastify';

// Import plugins in correct order
import sensiblePlugin from '../plugins/sensible';
import supabaseAuthPlugin from '../plugins/supabaseAuth';
import dbPlugin from '../plugins/db';
import rateLimitPlugin from '../plugins/ratelimit';

// Import routes
import rootRoutes from '../routes/root';
import healthRoutes from '../routes/health';
import authRoutes from '../routes/auth';
import projectsRoutes from '../routes/projects';
import deploysRoutes from '../routes/deploys';
import subscriptionsRoutes from '../routes/subscriptions';

export async function registerPluginsAndRoutes(
  fastify: FastifyInstance,
  opts: any
) {
  // Register plugins in dependency order
  // 1. Sensible must be first (error handling)
  await fastify.register(sensiblePlugin, opts);

  // 2. Supabase auth (creates fastify.supabase)
  await fastify.register(supabaseAuthPlugin, opts);

  // 3. DB plugin (depends on fastify.supabase)
  await fastify.register(dbPlugin, opts);

  // 4. Rate limiting
  await fastify.register(rateLimitPlugin, opts);

  // Register routes
  await fastify.register(rootRoutes, opts);
  await fastify.register(healthRoutes, opts);
  await fastify.register(authRoutes, opts);
  await fastify.register(projectsRoutes, opts);
  await fastify.register(deploysRoutes, opts);
  await fastify.register(subscriptionsRoutes, opts);
}
```

#### Update `src/app/build/build.ts`:

```typescript
// Replace this:
import { autoloadRoutesAndPlugins } from './autoload';

// With this:
import { registerPluginsAndRoutes } from './register';

// And replace this:
server.register(autoloadRoutesAndPlugins);

// With this:
await registerPluginsAndRoutes(server, {});
```

#### Plugin Dependencies Order:

1. **sensible** - Error handling (no dependencies)
2. **supabaseAuth** - Creates `fastify.supabase` decorator
3. **db** - Depends on `fastify.supabase`
4. **ratelimit** - Rate limiting (independent)

#### Files Affected:

- Delete: `src/app/build/autoload.ts`
- Create: `src/app/build/register.ts`
- Update: `src/app/build/build.ts`
- Remove dependency: `@fastify/autoload` from package.json

### 3. 🔧 Package.json Scripts Updates

#### Current Scripts Using npm/tsx:

```json
{
  "start": "tsx src/main.ts",
  "dev": "tsx watch src/main.ts",
  "test:smoke": "tsx src/smoke-tests/deploy.smoke.ts",
  "test:auth": "tsx src/smoke-tests/auth.smoke.ts"
}
```

#### Updated Scripts for Bun:

```json
{
  "start": "bun run src/main.ts",
  "dev": "bun --watch src/main.ts",
  "test": "bun test",
  "test:smoke": "bun run src/smoke-tests/deploy.smoke.ts",
  "test:auth": "bun run src/smoke-tests/auth.smoke.ts",
  "format": "bunx prettier . --write"
}
```

### 3. 🐳 Dockerfile Updates

#### Current Dockerfile:

- Uses `node:lts-alpine`
- Runs `npm install`
- Uses shell script with tsx

#### New Dockerfile:

```dockerfile
FROM oven/bun:1-alpine

ENV APP_URL=https://api.godeploy.app
ENV PORT=80

RUN apk add --no-cache bash zip unzip

WORKDIR /app

# Copy package.json and bun lockfile
COPY package.json bun.lockb ./

# Install dependencies with frozen lockfile
RUN bun install --frozen-lockfile --production

# Copy the rest of the application
COPY . .

EXPOSE 80

# Direct bun execution with OpenTelemetry
CMD ["bun", "run", "src/main.ts"]
```

### 4. 📜 Shell Scripts Updates

#### scripts/run.sh:

```bash
#!/bin/bash
HYPERDX_API_KEY=$HYPERDX_API_KEY \
OTEL_SERVICE_NAME=$OTEL_SERVICE_NAME \
bun run --preload '@hyperdx/node-opentelemetry/build/src/tracing' src/main.ts
```

#### scripts/run.local.sh:

```bash
#!/bin/bash
# Bun automatically loads .env files
HYPERDX_API_KEY=$HYPERDX_API_KEY \
OTEL_SERVICE_NAME=$OTEL_SERVICE_NAME \
bun run --preload '@hyperdx/node-opentelemetry/build/src/tracing' src/main.ts
```

### 5. 🔄 CI/CD Workflow Updates

#### .github/workflows/ci.yml:

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Test
        run: bun test
```

### 6. 🧪 Testing Migration

#### Current: Vitest

- Move from Vitest to Bun's built-in test runner
- Update test files to use Bun test syntax if needed
- Pattern: `*.test.ts` or `*.spec.ts` files

#### Example test migration:

```typescript
// From Vitest
import { describe, it, expect } from 'vitest';

// To Bun
import { describe, it, expect } from 'bun:test';
```

### 7. 📝 Files to Update

| File                            | Status | Changes Required                          |
| ------------------------------- | ------ | ----------------------------------------- |
| `package.json`                  | 🔴     | Update all scripts to use bun             |
| `Dockerfile`                    | 🔴     | Switch to oven/bun base image             |
| `scripts/run.sh`                | 🔴     | Replace tsx with bun                      |
| `scripts/run.local.sh`          | 🔴     | Replace tsx with bun, remove .env loading |
| `.github/workflows/ci.yml`      | 🔴     | Add bun setup action                      |
| `.github/workflows/release.yml` | 🔴     | Update if using npm commands              |
| `README.md`                     | 🔴     | Update installation & run instructions    |
| `CLAUDE.md`                     | 🔴     | Update commands section                   |
| `.gitignore`                    | 🔴     | Add bun.lockb                             |
| `.nvmrc`                        | 🟡     | Consider removing or keeping for fallback |
| `tsconfig.json`                 | 🟢     | Compatible with Bun                       |

### 8. 🚨 Dependencies to Watch

**Potential Compatibility Issues:**

- `@hyperdx/node-opentelemetry` - Test telemetry with `--preload`
- `@supabase/supabase-js` - Should work fine
- `fastify` & plugins - Excellent Bun support
- `tsx` - Can be removed from dependencies
- `dotenv` - Can be removed (Bun has built-in .env support)

### 9. 🎯 Benefits After Migration

1. **Performance**

   - ~3x faster startup time
   - ~10x faster package installation
   - Native TypeScript execution

2. **Docker Image**

   - ~50% smaller image size
   - Faster builds on DigitalOcean

3. **Developer Experience**

   - Built-in watch mode
   - Built-in test runner
   - Built-in .env loading
   - Simpler scripts

4. **Dependencies Removal**
   - `tsx` - No longer needed
   - `dotenv` - Built into Bun
   - Potentially `tslib` - Bun handles this

### 10. 📋 Execution Order

1. **Phase 1: Local Development** ✅

   - [x] Install Bun
   - [x] Run `bun install`
   - [ ] Update package.json scripts
   - [ ] Test local execution
   - [ ] Verify all features work

2. **Phase 2: Testing**

   - [ ] Migrate test files to Bun test
   - [ ] Run full test suite
   - [ ] Run smoke tests

3. **Phase 3: Docker & Deployment**

   - [ ] Update Dockerfile
   - [ ] Build and test Docker image locally
   - [ ] Update shell scripts
   - [ ] Test container execution

4. **Phase 4: CI/CD**

   - [ ] Update GitHub Actions workflows
   - [ ] Test PR workflow
   - [ ] Verify deployment pipeline

5. **Phase 5: Documentation**
   - [ ] Update README.md
   - [ ] Update CLAUDE.md
   - [ ] Update any other docs

### 11. 🔍 Validation Checklist

- [ ] API starts successfully with Bun
- [ ] All Fastify routes work
- [ ] Supabase connection works
- [ ] File uploads to S3/Spaces work
- [ ] OpenTelemetry/HyperDX reporting works
- [ ] All tests pass
- [ ] Docker container runs
- [ ] Deployment to DigitalOcean succeeds

### 12. 🔙 Rollback Plan

If issues arise:

1. Keep `package-lock.json` temporarily
2. Dockerfile can use multi-stage build for testing
3. Scripts can check for bun availability and fallback to npm
4. CI/CD can run both npm and bun tests initially

## Next Steps

1. Start with updating `package.json` scripts
2. Test each script locally with Bun
3. Once validated, proceed with Docker updates
4. Finally, update CI/CD after local validation

## Notes

- **OpenTelemetry**: May need special handling with `--preload` flag
- **Production**: Test thoroughly in staging before production deployment
- **Monitoring**: Watch for any performance metrics changes after deployment
