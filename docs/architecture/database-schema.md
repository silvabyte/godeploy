# Database Schema

GoDeploy uses Supabase (PostgreSQL) with Row Level Security (RLS) for multi-tenant data isolation.

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     tenants     │       │  tenant_users   │       │     users       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ tenant_id (FK)  │       │ id (PK)         │
│ name            │       │ user_id (FK)    │──────►│ tenant_id (FK)  │
│ created_at      │       │ role            │       │ email           │
└────────┬────────┘       │ created_at      │       │ created_at      │
         │                └─────────────────┘       └────────┬────────┘
         │                                                   │
         │                                                   │
         ▼                                                   ▼
┌─────────────────┐                               ┌─────────────────┐
│    projects     │                               │     deploys     │
├─────────────────┤                               ├─────────────────┤
│ id (PK)         │◄──────────────────────────────│ project_id (FK) │
│ tenant_id (FK)  │                               │ id (PK)         │
│ owner_id (FK)   │                               │ tenant_id (FK)  │
│ name            │                               │ user_id (FK)    │
│ subdomain       │                               │ url             │
│ description     │                               │ status          │
│ domain          │                               │ commit_sha      │
│ created_at      │                               │ commit_branch   │
│ updated_at      │                               │ commit_message  │
└─────────────────┘                               │ commit_url      │
                                                  │ created_at      │
                                                  │ updated_at      │
                                                  └─────────────────┘

┌─────────────────┐                               ┌─────────────────┐
│  subscriptions  │                               │  metrics_pages  │
├─────────────────┤                               ├─────────────────┤
│ id (PK)         │                               │ id (PK)         │
│ tenant_id (FK)  │                               │ tenant_id (FK)  │
│ plan_name       │                               │ owner_id (FK)   │
│ price_cents     │                               │ slug            │
│ currency        │                               │ title           │
│ interval        │                               │ description     │
│ status          │                               │ project_ids[]   │
│ trial_ends_at   │                               │ is_public       │
│ stripe_sub_id   │                               │ created_at      │
│ created_at      │                               │ updated_at      │
│ updated_at      │                               └─────────────────┘
└─────────────────┘
```

## Tables

### tenants

Multi-tenant isolation root. Every organization/account is a tenant.

| Column       | Type        | Description              |
| ------------ | ----------- | ------------------------ |
| `id`         | uuid        | Primary key              |
| `name`       | text        | Tenant/organization name |
| `created_at` | timestamptz | Creation timestamp       |

### users

User accounts linked to Supabase Auth.

| Column       | Type        | Description                             |
| ------------ | ----------- | --------------------------------------- |
| `id`         | uuid        | Primary key (matches `auth.users.id`)   |
| `tenant_id`  | uuid        | Foreign key to tenants (primary tenant) |
| `email`      | text        | User email address                      |
| `created_at` | timestamptz | Creation timestamp                      |

**Note:** Users can belong to multiple tenants via `tenant_users`.

### tenant_users

Many-to-many relationship for team membership.

| Column       | Type        | Description                                  |
| ------------ | ----------- | -------------------------------------------- |
| `tenant_id`  | uuid        | Foreign key to tenants                       |
| `user_id`    | uuid        | Foreign key to users                         |
| `role`       | text        | Role within tenant (e.g., 'owner', 'member') |
| `created_at` | timestamptz | Creation timestamp                           |

**Primary key:** (`tenant_id`, `user_id`)

### projects

Deployed SPA projects.

| Column        | Type        | Description                                                 |
| ------------- | ----------- | ----------------------------------------------------------- |
| `id`          | uuid        | Primary key                                                 |
| `tenant_id`   | uuid        | Foreign key to tenants                                      |
| `owner_id`    | uuid        | Foreign key to users (creator)                              |
| `name`        | text        | Project name                                                |
| `subdomain`   | text        | Unique subdomain (e.g., `my-app` for `my-app.godeploy.app`) |
| `description` | text        | Optional description                                        |
| `domain`      | text        | Custom domain (e.g., `www.example.com`)                     |
| `created_at`  | timestamptz | Creation timestamp                                          |
| `updated_at`  | timestamptz | Last update timestamp                                       |

**Constraints:**

- `subdomain` is unique across all tenants
- `domain` is unique when set

### deploys

Deployment history for projects.

| Column           | Type        | Description                     |
| ---------------- | ----------- | ------------------------------- |
| `id`             | uuid        | Primary key                     |
| `tenant_id`      | uuid        | Foreign key to tenants          |
| `project_id`     | uuid        | Foreign key to projects         |
| `user_id`        | uuid        | Foreign key to users (deployer) |
| `url`            | text        | CDN URL for deployed assets     |
| `status`         | text        | `pending`, `success`, `failed`  |
| `commit_sha`     | text        | Git commit SHA (optional)       |
| `commit_branch`  | text        | Git branch name (optional)      |
| `commit_message` | text        | Git commit message (optional)   |
| `commit_url`     | text        | Link to commit (optional)       |
| `created_at`     | timestamptz | Deploy start timestamp          |
| `updated_at`     | timestamptz | Last status update              |

### subscriptions

Billing and subscription management.

| Column                   | Type        | Description                           |
| ------------------------ | ----------- | ------------------------------------- |
| `id`                     | uuid        | Primary key                           |
| `tenant_id`              | uuid        | Foreign key to tenants                |
| `plan_name`              | text        | Subscription plan name                |
| `price_cents`            | integer     | Price in cents                        |
| `currency`               | text        | Currency code (default: 'usd')        |
| `interval`               | text        | Billing interval (default: 'monthly') |
| `status`                 | text        | `active`, `canceled`, `past_due`      |
| `trial_ends_at`          | timestamptz | Trial end date                        |
| `current_period_start`   | timestamptz | Current billing period start          |
| `current_period_end`     | timestamptz | Current billing period end            |
| `stripe_subscription_id` | text        | Stripe subscription ID                |
| `created_at`             | timestamptz | Creation timestamp                    |
| `updated_at`             | timestamptz | Last update timestamp                 |

### metrics_pages

Public metrics/status pages.

| Column        | Type        | Description                         |
| ------------- | ----------- | ----------------------------------- |
| `id`          | uuid        | Primary key                         |
| `tenant_id`   | uuid        | Foreign key to tenants              |
| `owner_id`    | uuid        | Foreign key to users                |
| `slug`        | text        | Unique URL slug                     |
| `title`       | text        | Page title                          |
| `description` | text        | Page description                    |
| `project_ids` | uuid[]      | Array of project IDs to display     |
| `is_public`   | boolean     | Whether page is publicly accessible |
| `created_at`  | timestamptz | Creation timestamp                  |
| `updated_at`  | timestamptz | Last update timestamp               |

## Row Level Security (RLS)

All tables have RLS enabled with policies that enforce tenant isolation.

### Policy Patterns

**Tenant-scoped read:**

```sql
CREATE POLICY "Users can view own tenant data"
ON projects FOR SELECT
USING (tenant_id IN (
  SELECT tenant_id FROM tenant_users
  WHERE user_id = auth.uid()
));
```

**Tenant-scoped write:**

```sql
CREATE POLICY "Users can insert in own tenant"
ON projects FOR INSERT
WITH CHECK (tenant_id IN (
  SELECT tenant_id FROM tenant_users
  WHERE user_id = auth.uid()
));
```

**Service role bypass:**

```sql
CREATE POLICY "Service role has full access"
ON projects FOR ALL
USING (auth.role() = 'service_role');
```

### Key RLS Behaviors

1. **Users** can only access data within their tenant(s)
2. **Service role** (used by API) bypasses RLS for administrative operations
3. **Public data** (like `metrics_pages` with `is_public = true`) is readable by anyone
4. **Cross-tenant queries** are impossible at the database level

## Migrations

Migrations are stored in `supabase/migrations/` with timestamp prefixes.

### Key Migrations

| Migration                                       | Purpose                     |
| ----------------------------------------------- | --------------------------- |
| `20250315013610_enable-uuid.sql`                | Enable UUID extension       |
| `20250315014902_create-tenants.sql`             | Create tenants table        |
| `20250315014934_create-users.sql`               | Create users table          |
| `20250315015005_create-projects.sql`            | Create projects table       |
| `20250315015024_create-deploys.sql`             | Create deploys table        |
| `20250315015059_enable-rls.sql`                 | Enable RLS on all tables    |
| `20250315015136_rls-policies.sql`               | Create RLS policies         |
| `20250315015200_handle-new-users.sql`           | Trigger for new user setup  |
| `20250323190414_billing_table.sql`              | Create subscriptions table  |
| `20250324000000_tenant_users.sql`               | Create tenant_users table   |
| `20250409192551_add_project_domain.sql`         | Add custom domain support   |
| `20250908132000_create-metrics-pages.sql`       | Create metrics_pages table  |
| `20250908132100_add-deploy-commit-metadata.sql` | Add git metadata to deploys |

### Running Migrations

```bash
# Apply pending migrations locally
bun db:up

# Create a new migration
bun db:new <migration_name>

# Push to remote database
bun db:push

# Pull remote schema
bun db:pull

# Reset local database
bun db:reset
```

## Triggers

### handle_new_user

Automatically creates tenant and user records when a new Supabase Auth user signs up:

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create tenant for new user
  INSERT INTO tenants (id, name)
  VALUES (gen_random_uuid(), NEW.email);

  -- Create user record
  INSERT INTO users (id, tenant_id, email)
  VALUES (NEW.id, (SELECT id FROM tenants WHERE name = NEW.email), NEW.email);

  -- Create tenant_users membership
  INSERT INTO tenant_users (tenant_id, user_id, role)
  VALUES ((SELECT tenant_id FROM users WHERE id = NEW.id), NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Indexes

Key indexes for query performance:

```sql
-- Project lookups by subdomain
CREATE UNIQUE INDEX idx_projects_subdomain ON projects(subdomain);

-- Project lookups by custom domain
CREATE UNIQUE INDEX idx_projects_domain ON projects(domain) WHERE domain IS NOT NULL;

-- Deploy history by project
CREATE INDEX idx_deploys_project_id ON deploys(project_id);

-- Deploy history by tenant
CREATE INDEX idx_deploys_tenant_id ON deploys(tenant_id);

-- Tenant membership lookups
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
```

## Related Documentation

- [Architecture Overview](overview.md) - System design
- [Authentication](../api/authentication.md) - Auth flow and JWT
- [Development Setup](../development/setup.md) - Local database setup
