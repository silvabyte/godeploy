# API Reference

The GoDeploy API is a REST API built with Fastify. Base URL: `https://api.godeploy.app`

## Authentication

Most endpoints require authentication via JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

See [Authentication](authentication.md) for details on obtaining tokens.

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed"
}
```

## Rate Limiting

- **Default:** 100 requests per minute per IP
- **Authenticated:** 1000 requests per minute per user
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Endpoints

### Health

#### GET /health

Health check endpoint.

**Auth required:** No

**Response:**

```json
{
  "status": "ok"
}
```

---

### Authentication

#### POST /api/auth/signup

Create a new account.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "...",
    "expires_in": 3600
  }
}
```

#### POST /api/auth/login

Sign in to existing account.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as signup

#### POST /api/auth/magic-link

Request a magic link for passwordless login.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "Magic link sent"
}
```

#### POST /api/auth/refresh

Refresh an expired access token.

**Auth required:** No

**Request body:**

```json
{
  "refresh_token": "..."
}
```

**Response:**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

#### POST /api/auth/password-reset

Request a password reset email.

**Auth required:** No

**Request body:**

```json
{
  "email": "user@example.com"
}
```

---

### Projects

#### GET /api/projects

List all projects for the authenticated user's tenant.

**Auth required:** Yes

**Query parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max results (default: 20, max: 100) |
| `offset` | number | Pagination offset |
| `name` | string | Filter by name (partial match) |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "my-app",
      "subdomain": "my-app",
      "description": "My awesome app",
      "domain": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "limit": 20,
    "offset": 0
  }
}
```

#### GET /api/projects/:id

Get a single project by ID.

**Auth required:** Yes

**Response:**

```json
{
  "id": "uuid",
  "name": "my-app",
  "subdomain": "my-app",
  "description": "My awesome app",
  "domain": "www.example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### POST /api/projects

Create a new project.

**Auth required:** Yes

**Request body:**

```json
{
  "name": "my-app",
  "subdomain": "my-app",
  "description": "My awesome app"
}
```

**Response:** Created project object

#### PATCH /api/projects/:id

Update a project.

**Auth required:** Yes

**Request body:**

```json
{
  "name": "updated-name",
  "description": "Updated description"
}
```

#### DELETE /api/projects/:id

Delete a project and all its deploys.

**Auth required:** Yes

**Response:** 204 No Content

---

### Deploys

#### GET /api/deploys

List all deploys for the authenticated user's tenant.

**Auth required:** Yes

**Query parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Max results (default: 20) |
| `offset` | number | Pagination offset |
| `project_id` | uuid | Filter by project |
| `status` | string | Filter by status (`pending`, `success`, `failed`) |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "url": "https://cdn.godeploy.app/...",
      "status": "success",
      "commit_sha": "abc123",
      "commit_branch": "main",
      "commit_message": "feat: add feature",
      "commit_url": "https://github.com/...",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "limit": 20,
    "offset": 0
  }
}
```

#### GET /api/deploys/:id

Get a single deploy by ID.

**Auth required:** Yes

#### POST /api/deploys

Create a new deploy by uploading a zip archive.

**Auth required:** Yes

**Content-Type:** `multipart/form-data`

**Form fields:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | file | Zip archive of build directory (max 500MB) |
| `project_id` | uuid | Target project ID |
| `commit_sha` | string | Git commit SHA (optional) |
| `commit_branch` | string | Git branch name (optional) |
| `commit_message` | string | Git commit message (optional) |
| `commit_url` | string | Link to commit (optional) |

**Response:**

```json
{
  "id": "uuid",
  "project_id": "uuid",
  "url": "https://my-app.godeploy.app",
  "status": "success",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Domains

#### GET /api/domains

List custom domains for the authenticated user's projects.

**Auth required:** Yes

#### POST /api/domains

Add a custom domain to a project.

**Auth required:** Yes

**Request body:**

```json
{
  "project_id": "uuid",
  "domain": "www.example.com"
}
```

**Response:**

```json
{
  "domain": "www.example.com",
  "status": "pending",
  "cname_target": "godeploy-nginx-xxx.ondigitalocean.app",
  "ssl_status": "pending"
}
```

#### DELETE /api/domains/:domain

Remove a custom domain.

**Auth required:** Yes

---

### Subscriptions

#### GET /api/subscriptions

Get the current subscription for the authenticated user's tenant.

**Auth required:** Yes

**Response:**

```json
{
  "id": "uuid",
  "plan_name": "pro",
  "status": "active",
  "price_cents": 1900,
  "currency": "usd",
  "interval": "monthly",
  "current_period_end": "2024-02-01T00:00:00Z"
}
```

---

### Metrics Pages

#### GET /api/metrics/pages

List metrics pages for the authenticated user.

**Auth required:** Yes

#### POST /api/metrics/pages

Create a public metrics page.

**Auth required:** Yes

**Request body:**

```json
{
  "slug": "my-status",
  "title": "My App Status",
  "description": "Status page for my app",
  "project_ids": ["uuid1", "uuid2"],
  "is_public": true
}
```

#### GET /api/public/metrics/:slug

Get public metrics data for a metrics page.

**Auth required:** No

**Response:**

```json
{
  "title": "My App Status",
  "description": "Status page for my app",
  "projects": [
    {
      "name": "my-app",
      "last_deploy": "2024-01-01T00:00:00Z",
      "status": "success"
    }
  ]
}
```

---

### Teams

#### GET /api/teams

List team members for the authenticated user's tenant.

**Auth required:** Yes

#### POST /api/teams/invite

Invite a user to the team.

**Auth required:** Yes

**Request body:**

```json
{
  "email": "teammate@example.com",
  "role": "member"
}
```

---

### Tokens

#### GET /api/tokens

List API tokens for the authenticated user.

**Auth required:** Yes

#### POST /api/tokens

Create a new API token.

**Auth required:** Yes

**Request body:**

```json
{
  "name": "CI/CD Token",
  "expires_at": "2025-01-01T00:00:00Z"
}
```

#### DELETE /api/tokens/:id

Revoke an API token.

**Auth required:** Yes

---

### Cache

#### POST /api/cache/purge

Purge CDN cache for a project.

**Auth required:** Yes

**Request body:**

```json
{
  "project_id": "uuid"
}
```

---

## Error Codes

| Status | Error                 | Description                                         |
| ------ | --------------------- | --------------------------------------------------- |
| 400    | Bad Request           | Invalid request body or parameters                  |
| 401    | Unauthorized          | Missing or invalid authentication                   |
| 403    | Forbidden             | Insufficient permissions                            |
| 404    | Not Found             | Resource not found                                  |
| 409    | Conflict              | Resource already exists (e.g., duplicate subdomain) |
| 413    | Payload Too Large     | File upload exceeds 500MB limit                     |
| 429    | Too Many Requests     | Rate limit exceeded                                 |
| 500    | Internal Server Error | Server error                                        |

## Related Documentation

- [Authentication](authentication.md) - Auth flow and JWT tokens
- [Architecture Overview](../architecture/overview.md) - System design
- [CLI Usage](../guides/cli-usage.md) - Using the CLI to interact with the API
