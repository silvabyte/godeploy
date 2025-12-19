# Authentication

GoDeploy uses Supabase Auth for authentication with JWT tokens. This document covers the authentication flow, token management, and API integration.

## Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────►│  Supabase   │────►│  GoDeploy   │
│ (CLI/Web)   │     │    Auth     │     │    API      │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │
      │  1. Credentials    │                   │
      │───────────────────►│                   │
      │                    │                   │
      │  2. JWT Tokens     │                   │
      │◄───────────────────│                   │
      │                    │                   │
      │  3. API Request + Bearer Token         │
      │───────────────────────────────────────►│
      │                    │                   │
      │                    │  4. Validate JWT  │
      │                    │◄──────────────────│
      │                    │                   │
      │  5. Response                           │
      │◄───────────────────────────────────────│
```

## Authentication Methods

### Email/Password

Traditional email and password authentication.

```bash
# CLI
godeploy auth sign-up    # Create account
godeploy auth login      # Sign in
```

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Magic Links

Passwordless authentication via email link.

```http
POST /api/auth/magic-link
Content-Type: application/json

{
  "email": "user@example.com"
}
```

User receives an email with a link that authenticates them directly.

## JWT Tokens

Supabase Auth issues two tokens:

| Token           | Purpose                 | Lifetime |
| --------------- | ----------------------- | -------- |
| `access_token`  | API authentication      | 1 hour   |
| `refresh_token` | Obtain new access token | 7 days   |

### Token Structure

The access token is a JWT containing:

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "exp": 1704067200,
  "iat": 1704063600
}
```

### Using Tokens

Include the access token in the `Authorization` header:

```http
GET /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

When the access token expires, use the refresh token to get a new one:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "your-refresh-token"
}
```

Response:

```json
{
  "access_token": "new-access-token",
  "refresh_token": "new-refresh-token",
  "expires_in": 3600
}
```

## CLI Token Management

The CLI stores tokens in an XDG-compliant location:

```
~/.config/godeploy/config.json
```

Token structure:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_at": "2024-01-01T00:00:00Z"
}
```

### Automatic Refresh

The CLI automatically refreshes tokens when:

- Access token is expired or about to expire (within 5 minutes)
- A 401 response is received from the API

### Token Commands

```bash
godeploy auth status    # Check authentication status
godeploy auth logout    # Clear stored tokens
```

## API Authentication Flow

### 1. Request Arrives

```typescript
// Request with Authorization header
Authorization: Bearer<access_token>;
```

### 2. supabaseAuth Plugin

The Fastify plugin validates the token:

```typescript
// apps/api/src/app/plugins/supabaseAuth.ts
fastify.addHook("onRequest", async (request, reply) => {
  // Skip auth for public routes
  if (!request.routeOptions.config?.auth) return;

  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) throw fastify.httpErrors.unauthorized();

  // Validate with Supabase
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) throw fastify.httpErrors.unauthorized();

  // Get user's tenant
  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  // Decorate request
  request.user = {
    user_id: user.id,
    tenant_id: userData.tenant_id,
  };
});
```

### 3. Request Decoration

After authentication, the request object contains:

```typescript
request.user = {
  user_id: string;    // Supabase Auth user ID
  tenant_id: string;  // User's tenant ID
}
```

### 4. Tenant Isolation

All database queries use `tenant_id` for isolation:

```typescript
const projects = await db
  .from("projects")
  .select("*")
  .eq("tenant_id", request.user.tenant_id);
```

## Route Configuration

Routes specify authentication requirements in their config:

```typescript
// Authenticated route
fastify.get("/api/projects", {
  config: { auth: true },
  handler: async (request, reply) => {
    // request.user is available
  },
});

// Public route
fastify.get("/api/public/metrics/:slug", {
  config: { auth: false },
  handler: async (request, reply) => {
    // No authentication required
  },
});
```

## Multi-Tenancy

### User-Tenant Relationship

Users can belong to multiple tenants via `tenant_users`:

```sql
SELECT t.* FROM tenants t
JOIN tenant_users tu ON t.id = tu.tenant_id
WHERE tu.user_id = 'user-uuid';
```

### Primary Tenant

The `users.tenant_id` field indicates the user's primary tenant, used for:

- Default context when no tenant is specified
- Initial tenant created on signup

### Switching Tenants

(Future feature) Users will be able to switch between tenants they belong to.

## Security Considerations

### Token Storage

- **CLI:** Stored in user's config directory with appropriate permissions
- **Browser:** Stored in memory or secure storage (not localStorage)
- **Never:** Commit tokens to version control

### Token Transmission

- Always use HTTPS
- Tokens sent only in Authorization header
- Never include tokens in URLs or query parameters

### Token Validation

- Tokens validated on every request
- Expired tokens rejected immediately
- Invalid signatures rejected

### Rate Limiting

- Unauthenticated: 100 requests/minute
- Authenticated: 1000 requests/minute
- Failed auth attempts: Additional limits apply

## Troubleshooting

### "Unauthorized" Errors

1. Check token is present in Authorization header
2. Verify token hasn't expired
3. Try refreshing the token
4. Re-authenticate if refresh fails

### Token Refresh Failures

1. Refresh token may be expired (7 days)
2. User may have been deleted
3. Re-authenticate with credentials

### CLI Authentication Issues

```bash
# Check current status
godeploy auth status

# Clear and re-authenticate
godeploy auth logout
godeploy auth login
```

## Related Documentation

- [API Reference](reference.md) - Endpoint documentation
- [Architecture Overview](../architecture/overview.md) - System design
- [Database Schema](../architecture/database-schema.md) - User and tenant tables
