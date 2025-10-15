# GoDeploy Infrastructure Documentation

## Overview

GoDeploy is a SaaS deployment platform running on DigitalOcean App Platform with Supabase as the backend database. The system consists of an API service and a static site hosting service.

---

## DigitalOcean App Platform

### Applications

#### 1. GoDeploy API

- **App ID**: `cba914c8-7a71-49a4-bd70-754e093393af`
- **URL**: https://api.godeploy.app
- **Region**: NYC (New York)
- **Tier**: Basic
- **Created**: March 15, 2025
- **Last Updated**: August 31, 2025

##### Deployment Configuration

- **Source Repository**: github.com/silvabyte/godeploy-api
- **Branch**: main
- **Auto-deploy**: Enabled (deploys on push)
- **Build Method**: Docker (Dockerfile at root)
- **Instance**: 1x apps-s-1vcpu-0.5gb
- **HTTP Port**: 80
- **Health Status**: ✅ HEALTHY

##### Resource Usage

- **CPU Usage**: ~3.7%
- **Memory Usage**: ~63.7%
- **Replicas**: 1/1 ready

##### Environment Variables

| Variable                        | Description                              | Scope           |
| ------------------------------- | ---------------------------------------- | --------------- |
| `SUPABASE_URL`                  | https://gadyljeftebtastrldaq.supabase.co | Runtime         |
| `SUPABASE_API_KEY`              | [Encrypted]                              | Runtime         |
| `DIGITAL_OCEAN_TOKEN`           | [Encrypted]                              | Runtime         |
| `DIGITAL_OCEAN_SPACES_KEY`      | DO00XHP9FVWRPKQZKNVW                     | Runtime         |
| `DIGITAL_OCEAN_SPACES_SECRET`   | [Encrypted]                              | Runtime         |
| `DIGITAL_OCEAN_SPACES_ENDPOINT` | nyc3.digitaloceanspaces.com              | Runtime         |
| `DIGITAL_OCEAN_SPACES_BUCKET`   | godeploy-spa-assets                      | Runtime         |
| `DIGITAL_OCEAN_NGINX_APP_ID`    | 119c27f0-38bf-4150-af45-5a59ace673c5     | Runtime         |
| `APP_URL`                       | https://api.godeploy.app                 | Runtime         |
| `HOST`                          | 0.0.0.0                                  | Runtime         |
| `NODE_ENV`                      | production                               | Build & Runtime |
| `TELEMETRY_KEY`                 | [Encrypted]                              | Build & Runtime |
| `HYPERDX_API_KEY`               | [Encrypted]                              | Build & Runtime |
| `OTEL_SERVICE_NAME`             | godeploy-api                             | Build & Runtime |

##### Deployment Details

- **Last Deployment ID**: `ce5658a6-033f-4bea-a5b7-84f8dd2636ac`
- **Last Commit**: `ef03a4d2caa540a6976b92a99417f026c3fbc8de`
- **Commit Message**: "fix: user tenant id constraint"
- **Deployment Date**: July 16, 2025
- **Build Time**: ~104 seconds
- **Billable Build Time**: ~84 seconds

##### Monitoring & Alerts

- Deployment failure notifications
- Domain configuration failure notifications

#### 2. GoDeploy Nginx (Static Site)

- **App ID**: `119c27f0-38bf-4150-af45-5a59ace673c5`
- **URL**: https://spa.godeploy.app
- **Region**: NYC (New York)
- **Tier**: Basic
- **Created**: March 15, 2025
- **Last Updated**: August 31, 2025

### DigitalOcean Spaces

- **Endpoint**: nyc3.digitaloceanspaces.com
- **Bucket**: godeploy-spa-assets
- **Purpose**: Static asset storage for deployed SPAs

---

## Supabase Database

### Project Information

- **Project ID**: `gadyljeftebtastrldaq`
- **Project Name**: godeploy
- **Organization ID**: `gemoxzlvausdjvnwblrd`
- **Region**: US-East-2
- **Status**: ✅ ACTIVE_HEALTHY
- **Database Host**: db.gadyljeftebtastrldaq.supabase.co
- **PostgreSQL Version**: 15.8.1.044
- **Created**: March 15, 2025

### Database Schema

#### Tables (All RLS-enabled)

##### 1. **tenants** (8 rows)

| Column       | Type        | Description                  |
| ------------ | ----------- | ---------------------------- |
| `id`         | uuid        | Primary key (auto-generated) |
| `name`       | text        | Tenant organization name     |
| `created_at` | timestamptz | Creation timestamp           |

##### 2. **users** (8 rows)

| Column       | Type        | Description                      |
| ------------ | ----------- | -------------------------------- |
| `id`         | uuid        | Primary key (matches auth.users) |
| `email`      | text        | User email (unique)              |
| `tenant_id`  | uuid        | Associated tenant                |
| `created_at` | timestamptz | Creation timestamp               |

##### 3. **projects** (20 rows)

| Column        | Type        | Description                    |
| ------------- | ----------- | ------------------------------ |
| `id`          | uuid        | Primary key (auto-generated)   |
| `tenant_id`   | uuid        | Owning tenant                  |
| `owner_id`    | uuid        | Project owner user             |
| `name`        | text        | Project name                   |
| `subdomain`   | text        | Unique subdomain               |
| `domain`      | text        | Custom domain (nullable)       |
| `description` | text        | Project description (nullable) |
| `created_at`  | timestamptz | Creation timestamp             |
| `updated_at`  | timestamptz | Last update timestamp          |

##### 4. **deploys** (105 rows)

| Column       | Type        | Description                            |
| ------------ | ----------- | -------------------------------------- |
| `id`         | uuid        | Primary key (auto-generated)           |
| `tenant_id`  | uuid        | Tenant reference                       |
| `project_id` | uuid        | Associated project                     |
| `user_id`    | uuid        | Deploying user                         |
| `url`        | text        | Deployment URL                         |
| `status`     | text        | Deployment status (default: 'pending') |
| `created_at` | timestamptz | Creation timestamp                     |
| `updated_at` | timestamptz | Last update timestamp                  |

##### 5. **subscriptions** (1 row)

| Column                   | Type        | Description                             |
| ------------------------ | ----------- | --------------------------------------- |
| `id`                     | uuid        | Primary key (auto-generated)            |
| `tenant_id`              | uuid        | Subscribing tenant                      |
| `plan_name`              | text        | Subscription plan name                  |
| `price_cents`            | integer     | Price in cents                          |
| `currency`               | text        | Currency code (default: 'usd')          |
| `interval`               | text        | Billing interval (default: 'monthly')   |
| `status`                 | text        | Subscription status (default: 'active') |
| `trial_ends_at`          | timestamptz | Trial expiration (nullable)             |
| `current_period_start`   | timestamptz | Current billing period start            |
| `current_period_end`     | timestamptz | Current billing period end              |
| `stripe_subscription_id` | text        | Stripe subscription ID (nullable)       |
| `created_at`             | timestamptz | Creation timestamp                      |
| `updated_at`             | timestamptz | Last update timestamp                   |

##### 6. **tenant_users** (7 rows)

| Column       | Type        | Description                  |
| ------------ | ----------- | ---------------------------- |
| `id`         | uuid        | Primary key (auto-generated) |
| `tenant_id`  | uuid        | Tenant reference             |
| `user_id`    | uuid        | User reference               |
| `role`       | text        | User role (default: 'admin') |
| `created_at` | timestamptz | Creation timestamp           |
| `updated_at` | timestamptz | Last update timestamp        |

### Active PostgreSQL Extensions

- **uuid-ossp**: UUID generation
- **pgcrypto**: Cryptographic functions
- **pg_stat_statements**: Query performance monitoring
- **pgjwt**: JWT token handling
- **pg_graphql**: GraphQL API layer
- **supabase_vault**: Secrets management
- **pgsodium**: Modern encryption

### Migration History

Total migrations: 23

1. `20250315013610` - enable-uuid
2. `20250315014902` - create-tenants
3. `20250315014934` - create-users
4. `20250315015005` - create-projects
5. `20250315015024` - create-deploys
6. `20250315015059` - enable-rls
7. `20250315015136` - rls-policies
8. `20250315015200` - handle-new-users
9. `20250315041014` - service-role-rls
10. `20250315041421` - add-project-description
11. `20250321214746` - fix_users_rls
12. `20250321215306` - fix_service_bypass_rls
13. `20250321223037` - users_rls_v2
14. `20250322002911` - users_rls_v3
15. `20250322004203` - users_rls_v4
16. `20250322004650` - users_drop_fk
17. `20250322004802` - users_rls_v5
18. `20250323190414` - billing_table
19. `20250324000000` - tenant_users
20. `20250409110008` - fix_user_view_user_rls
21. `20250409112620` - fix_manage_tenant_users_rls
22. `20250409192551` - add_project_domain
23. `20250715222708` - drop_users_tenant_id_unique_constraint

### Security Issues ⚠️

#### High Priority

1. **Function Search Path Vulnerability**
   - Affected: `get_user_tenants`, `handle_new_user`
   - Risk: Search path manipulation
   - [Fix Guide](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable)

2. **OTP Expiry Too Long**
   - Current: >1 hour
   - Recommended: <1 hour
   - [Fix Guide](https://supabase.com/docs/guides/platform/going-into-prod#security)

3. **Leaked Password Protection Disabled**
   - Status: Not checking against HaveIBeenPwned
   - [Fix Guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

### Performance Issues ⚠️

1. **RLS Policy Inefficiency**
   - Affected Tables: `tenant_users`, `projects`, `deploys`, `subscriptions`, `users`, `tenants`
   - Issue: `auth.uid()` calls re-evaluated per row
   - Solution: Replace `auth.uid()` with `(SELECT auth.uid())`
   - [Fix Guide](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan)

2. **Multiple Permissive Policies**
   - Affected: `projects` (2 SELECT policies), `tenant_users` (3 SELECT policies)
   - Impact: Each policy executed for every query
   - [Fix Guide](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies)

3. **Unused Index**
   - Index: `idx_tenant_users_tenant_id` on `tenant_users`
   - Recommendation: Consider removal

### Current Subscription

- **Tenant ID**: `7c574f3c-862a-4bc5-89d4-b1f11aaac65f`
- **Plan**: Unlimited
- **Price**: $49.00/year
- **Status**: Active
- **Trial Ends**: April 23, 2025
- **Current Period**: April 9, 2025 - April 9, 2026
- **Stripe Integration**: Not connected

---

## Architecture Summary

### Tech Stack

- **Backend Framework**: Fastify (Node.js)
- **Database**: PostgreSQL 15.8 (Supabase)
- **Hosting**: DigitalOcean App Platform
- **Storage**: DigitalOcean Spaces
- **Monitoring**: HyperDX (OpenTelemetry)
- **Authentication**: Supabase Auth
- **Container**: Docker

### Key Features

- Multi-tenant architecture with RLS
- GitHub auto-deployment integration
- Custom domain support
- Subscription/billing system ready
- Static SPA hosting capability
- Comprehensive audit logging

### Data Flow

1. Users authenticate via Supabase Auth
2. API requests hit DigitalOcean App Platform
3. Fastify API validates requests and applies business logic
4. Database operations use RLS for tenant isolation
5. Static assets stored in DigitalOcean Spaces
6. Deployments tracked in database with status updates

### Security Model

- Row Level Security (RLS) on all tables
- Tenant isolation at database level
- JWT-based authentication
- Encrypted environment variables
- Service role bypass for admin operations

---

## Recommendations

### Immediate Actions

1. Fix RLS policy performance issues (wrap `auth.uid()` calls)
2. Enable leaked password protection
3. Reduce OTP expiry to <1 hour
4. Fix function search path vulnerabilities

### Future Improvements

1. Consolidate multiple permissive RLS policies
2. Remove unused database index
3. Consider upgrading instance size if memory usage increases
4. Implement Stripe subscription integration
5. Add database backups and disaster recovery plan

---

_Last Updated: August 31, 2025_
