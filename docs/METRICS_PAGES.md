# Metrics Pages API

Create shareable public pages that showcase deployment frequency (and later DORA metrics) for one or more projects. Deployment frequency is a powerful signal that real value is being shipped — far more meaningful than commit graphs.

## Concepts

- Metrics Page: A public page addressable by a `slug` that aggregates metrics across selected projects.
- Deployment Frequency (phase 1): Daily counts of successful deployments for each project in the page.
- Commit Metadata: Optional commit info attached to each deploy to enable richer future visualizations.

## Authentication

- Public endpoints: no auth required (read-only for published pages)
- Owner endpoints: require a bearer token
  - `Authorization: Bearer <token>` (see `docs/AUTH_DOCUMENTATION.md`)

## Public Endpoints

### Get Page Metadata

- `GET /api/public/metrics/:slug`
- Response 200:

```json
{
  "slug": "my-app-metrics",
  "title": "My App Metrics",
  "description": "Shipping pace and reliability",
  "projectIds": ["project-uuid-1", "project-uuid-2"],
  "isPublic": true
}
```

### Get Daily Deployment Frequency

- `GET /api/public/metrics/:slug/deploy-frequency?from=ISO&to=ISO&interval=day`
  - Default range: last 30 days
  - `interval` currently supports `day`
- Response 200 (example):

```json
{
  "range": {
    "from": "2025-08-10T00:00:00.000Z",
    "to": "2025-09-08T13:00:00.000Z",
    "interval": "day"
  },
  "series": [
    {
      "projectId": "project-uuid-1",
      "data": [
        { "date": "2025-08-10", "count": 0 },
        { "date": "2025-08-11", "count": 2 }
      ]
    },
    {
      "projectId": "project-uuid-2",
      "data": [
        { "date": "2025-08-10", "count": 1 },
        { "date": "2025-08-11", "count": 0 }
      ]
    }
  ],
  "totals": {
    "overall": 3,
    "byProject": { "project-uuid-1": 2, "project-uuid-2": 1 }
  }
}
```

Notes

- Counts include only successful deployments within the time window.
- Dates are zero-filled so charts render contiguous time axes.

## Owner Endpoints (CRUD)

### Create Page

- `POST /api/metrics/pages`
- Body:

```json
{
  "slug": "my-app-metrics", // optional; auto-generated if omitted
  "title": "My App Metrics",
  "description": "Shipping pace and reliability",
  "projectIds": ["project-uuid-1", "project-uuid-2"],
  "isPublic": true
}
```

- Response 201: Full page record, including `id`, timestamps, etc.

### Update Page

- `PATCH /api/metrics/pages/:id`
- Body (any subset):

```json
{
  "slug": "my-metrics-new-slug",
  "title": "Updated Title",
  "description": "Updated description",
  "projectIds": ["project-uuid-1"],
  "isPublic": false
}
```

### List Pages

- `GET /api/metrics/pages`
- Response 200: Array of pages for your tenant.

### Delete Page

- `DELETE /api/metrics/pages/:id`
- Response 204

## Deployments: Commit Metadata (for CLI)

When creating a deployment, you can attach commit metadata. This is stored per deploy and enables richer visuals later (e.g., hover cards with commit details):

- `POST /api/deploy?project=<name>&commit_sha=<sha>&commit_branch=<branch>&commit_message=<msg>&commit_url=<url>`

Example:

```bash
curl -X POST "https://api.godeploy.app/api/deploy?project=my-app\
  &commit_sha=abc123\
  &commit_branch=main\
  &commit_message=Fix%20billing%20edge%20case\
  &commit_url=https%3A%2F%2Fgithub.com%2Facme%2Fmy-app%2Fcommit%2Fabc123" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "archive=@./dist.zip"
```

## cURL Examples

```bash
# Create a metrics page (auth required)
TOKEN=your_token
curl -s -X POST https://api.godeploy.app/api/metrics/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My App Metrics",
    "projectIds": ["project-uuid-1", "project-uuid-2"],
    "isPublic": true
  }'

# Fetch public page metadata
curl -s https://api.godeploy.app/api/public/metrics/my-app-metrics

# Fetch daily deployment frequency for last 30 days
curl -s "https://api.godeploy.app/api/public/metrics/my-app-metrics/deploy-frequency"

# Fetch a specific range
curl -s "https://api.godeploy.app/api/public/metrics/my-app-metrics/deploy-frequency?from=2025-08-01T00:00:00.000Z&to=2025-08-31T23:59:59.999Z"
```

## JavaScript Examples

```ts
// Create metrics page
async function createPage(
  token: string,
  payload: {
    slug?: string;
    title?: string;
    description?: string;
    projectIds: string[];
    isPublic?: boolean;
  },
) {
  const res = await fetch("https://api.godeploy.app/api/metrics/pages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create page");
  return res.json();
}

// Get public page metadata
async function getPage(slug: string) {
  const res = await fetch(
    `https://api.godeploy.app/api/public/metrics/${slug}`,
  );
  return res.json();
}

// Get frequency time series
async function getFrequency(slug: string, from?: string, to?: string) {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const res = await fetch(
    `https://api.godeploy.app/api/public/metrics/${slug}/deploy-frequency?${qs}`,
  );
  return res.json();
}
```

## Notes & Limits

- Public pages expose only aggregated counts; they do not leak private data beyond what you select.
- The server currently supports `day` granularity and a default 30-day window.
- For large portfolios, expect future improvements (pre-aggregations/materialized views).
- Slug must be unique; server will generate one if omitted.
