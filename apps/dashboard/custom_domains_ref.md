# Custom Domain API Documentation

Use these endpoints to configure and manage custom domains for your projects. A valid CNAME record must exist that points your chosen hostname to the platform’s CNAME target before assigning the domain to a project.

## Prerequisites

- A DNS provider where you can create records for your domain.
- For authenticated endpoints, include a bearer token header. See `docs/AUTH_DOCUMENTATION.md`.
  - `Authorization: Bearer <token>`

## CNAME Target

Retrieve the CNAME target your DNS must point to.

- Endpoint: `GET /api/domains/cname-target`
- Auth: none (public)

Example

```bash
curl -s https://api.godeploy.app/api/domains/cname-target
```

Success (200)

```json
{
  "target": "godeploy-nginx-o3dvb.ondigitalocean.app"
}
```

Notes

- The target can be customized via the `GODEPLOY_CNAME_TARGET` environment variable.

## Validate DNS (public)

Checks if a domain’s CNAME is correctly configured to the expected target.

- Endpoint: `POST /api/domains/validate`
- Auth: none (public)
- Body:

```json
{ "domain": "www.example.com" }
```

Success (200)

```json
{
  "isValid": true,
  "cnameRecord": "godeploy-nginx-o3dvb.ondigitalocean.app"
}
```

Invalid CNAME (200 with isValid=false)

```json
{
  "isValid": false,
  "cnameRecord": "other.destination.example.com",
  "error": "CNAME points to other.destination.example.com, expected godeploy-nginx-o3dvb.ondigitalocean.app"
}
```

Validation error (400)

```json
{
  "error": "Invalid domain format",
  "message": "The provided domain is not in a valid format"
}
```

## Check Availability (auth)

Determines if a domain is not already used by another project and that its CNAME configuration is valid.

- Endpoint: `POST /api/domains/check-availability`
- Auth: bearer token required
- Body:

```json
{ "domain": "www.example.com", "projectId": "<optional-project-id-to-exclude>" }
```

Success (200)

```json
{ "available": true }
```

Unavailable or misconfigured (200)

```json
{ "available": false, "reason": "Domain is already in use by another project" }
```

or

```json
{ "available": false, "reason": "No CNAME record found for domain" }
```

Errors

- 400: Invalid domain format
- 500: Failed to check domain availability or DNS validation failure

## Assign or Remove a Custom Domain (auth)

Assigns a validated custom domain to a project, or removes it by sending `null`.

- Endpoint: `PATCH /api/projects/:projectId/domain`
- Auth: bearer token required
- Body to assign:

```json
{ "domain": "www.example.com" }
```

Body to remove:

```json
{ "domain": null }
```

Behavior

- On assign:
  - Validates domain format
  - Ensures domain is not used by another project
  - Validates that the domain’s CNAME points to the expected target
- On remove:
  - Clears the custom domain for the project
- Response includes the project and a computed `url` field that will use the custom domain if present, otherwise the platform subdomain.

Success (200)

```json
{
  "id": "project-id",
  "tenant_id": "tenant-id",
  "owner_id": "user-id",
  "name": "my-project",
  "subdomain": "abc123-sunrise",
  "description": null,
  "domain": "www.example.com",
  "url": "https://www.example.com",
  "created_at": "2024-08-31T12:00:00.000Z",
  "updated_at": "2024-08-31T12:34:56.000Z"
}
```

Possible errors

- 400: Invalid domain format or invalid CNAME configuration
- 403: Unauthorized to update project
- 404: Project not found
- 409: Domain already in use
- 500: Failed to update domain

## DNS Configuration Guide

- Create a CNAME record for your chosen hostname (e.g., `www.example.com`) that points to the value returned by `GET /api/domains/cname-target`.
- Wait for DNS propagation (typically up to a few minutes, sometimes longer depending on TTL).
- Use `POST /api/domains/validate` to confirm `isValid: true` before assigning the domain.
- Apex/root domains (e.g., `example.com`) generally cannot be CNAMEs. The validator checks for a CNAME specifically, so use a subdomain like `www`. If your DNS provider supports ALIAS/ANAME or flattening at the apex, note that those are not currently validated by this API.
- Recommended: point `www` via CNAME and set a redirect from the apex to `www` at your DNS or registrar.

## Integration Examples

JavaScript

```ts
// Fetch CNAME target
const getCnameTarget = async () => {
  const res = await fetch("https://api.godeploy.app/api/domains/cname-target");
  return res.json();
};

// Validate domain DNS
const validateDomain = async (domain) => {
  const res = await fetch("https://api.godeploy.app/api/domains/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain }),
  });
  return res.json();
};

// Check availability (auth)
const checkAvailability = async (token, domain, projectId) => {
  const res = await fetch(
    "https://api.godeploy.app/api/domains/check-availability",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ domain, projectId }),
    },
  );
  return res.json();
};

// Assign custom domain (auth)
const assignDomain = async (token, projectId, domain) => {
  const res = await fetch(
    `https://api.godeploy.app/api/projects/${projectId}/domain`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ domain }),
    },
  );
  return res.json();
};
```

cURL

```bash
# Get CNAME target (public)
curl -s https://api.godeploy.app/api/domains/cname-target

# Validate DNS (public)
curl -s -X POST https://api.godeploy.app/api/domains/validate \
  -H "Content-Type: application/json" \
  -d '{"domain":"www.example.com"}'

# Check availability (auth)
TOKEN=your_token_here
curl -s -X POST https://api.godeploy.app/api/domains/check-availability \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"www.example.com"}'

# Assign to project (auth)
PROJECT_ID=your_project_id
curl -s -X PATCH https://api.godeploy.app/api/projects/$PROJECT_ID/domain \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":"www.example.com"}'

# Remove custom domain (auth)
curl -s -X PATCH https://api.godeploy.app/api/projects/$PROJECT_ID/domain \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain":null}'
```

## Returned Project URL

- The API computes a `url` for each project. If a custom domain is set and valid, the `url` uses that domain; otherwise it falls back to the platform subdomain (`{subdomain}.spa.godeploy.app`).
- You can see this field on responses from `GET /api/projects`, `POST /api/projects`, and `PATCH /api/projects/:projectId/domain`.

## Error Codes Summary

| Status | Meaning                                              |
| ------ | ---------------------------------------------------- |
| 200    | Success                                              |
| 400    | Invalid domain format or invalid CNAME configuration |
| 403    | Unauthorized to update project                       |
| 404    | Project not found                                    |
| 409    | Domain already in use                                |
| 500    | Internal error during validation or update           |

## Environment

- `GODEPLOY_CNAME_TARGET`: the expected CNAME value; also returned by `GET /api/domains/cname-target`.

## Notes

- Domains must be lowercase and in a valid hostname format; the API rejects invalid inputs.
- CNAME validation trims trailing dots and is case-insensitive.
- If you plan to support apex/ALIAS in the future, API changes would be required; current validation is strictly CNAME-based.
