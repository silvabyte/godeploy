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

---

# Frontend Plan (godeploy-ui)

This section outlines how to implement Metrics Pages in this UI repository. It covers routes, services, components, state management, testing, and rollout. The design leverages existing patterns in `src/services`, `react-router` loaders/actions, and Recharts-based charts.

## Goals

- Allow authenticated users to create and manage public “Metrics Pages” combining multiple projects.
- Provide anonymous, shareable viewer pages accessible by slug without authentication.
- Visualize daily deployment frequency per project with zero-filled time series for consistent charts.

## Non-Goals (Phase 1)

- DORA metrics beyond deployment frequency.
- Advanced chart customization (stacked/group vs. toggle is fine later).
- Per-project permissions management beyond current tenant ownership.

## Routing

- Public route (no auth): `GET /m/:slug`
  - Implemented as a top-level route sibling to the authenticated app so it bypasses the root auth loader.
  - Minimal layout without sidebar/header; keep tailwind styles.
- Authenticated management routes:
  - `/metrics` — list and manage pages
  - `/metrics/new` — creation form (or a dialog mounted in `/metrics`)
  - `/metrics/:id` — edit page (title/description/projects/isPublic)

Router integration (sketch):

```tsx
// src/router/routes.tsx
import { PublicMetricsPage } from '../pages/metrics/PublicMetricsPage'

export function createRouter(services: Services) {
  return createBrowserRouter([
    createRoutes(services),
    {
      path: '/m/:slug',
      element: <PublicMetricsPage />, // no loader enforcing auth
      errorElement: <AppErrorOutlet />,
    },
    // existing '/session' route remains
  ])
}
```

Add private routes under `createRoutes(services)` children:

```tsx
// inside children of the authenticated app
{
  path: 'metrics',
  element: <MetricsPagesPage />, // list + CTA
  loader: (args) => metricsPagesLoader(args, services),
},
{
  path: 'metrics/new',
  element: <MetricsPageEditor mode="create" />, // or dialog pattern
  action: (args) => createMetricsPageAction(args, services),
},
{
  path: 'metrics/:id',
  element: <MetricsPageEditor mode="edit" />,
  loader: (args) => metricsPageLoader(args, services),
  action: (args) => updateOrDeleteMetricsPageAction(args, services),
},
```

## Navigation

- Gate behind a feature flag `ENABLE_METRICS_PAGES` in `src/featureflags/ff.ts`.
- When enabled, show a nav item “Metrics” under main navigation.

Flag addition (plan only):

```ts
// src/featureflags/ff.ts
export const FLAGS = {
  ...,
  ENABLE_METRICS_PAGES: 32,
} as const
```

## Services

Add `src/services/MetricsPageService.ts` mirroring `DomainService` style (REST via `config.VITE_API_BASE_URL` and `SessionManager`):

```ts
// src/services/MetricsPageService.ts
import { config } from '../config'
import { SessionManager } from './auth/SessionManager'

export interface MetricsPage {
  id: string
  slug: string
  title?: string
  description?: string
  projectIds: string[]
  isPublic: boolean
  created_at?: string
  updated_at?: string
}

export interface FrequencyRange { from: string; to: string; interval: 'day' }
export interface FrequencySeries {
  projectId: string
  data: { date: string; count: number }[]
}
export interface FrequencyResponse {
  range: FrequencyRange
  series: FrequencySeries[]
  totals: { overall: number; byProject: Record<string, number> }
}

export class MetricsPageService {
  private readonly apiBase = config.VITE_API_BASE_URL || 'https://api.godeploy.app'
  private readonly session = SessionManager.getInstance()

  private headers(): HeadersInit {
    const token = this.session.session?.access_token
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  }
  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.apiBase}${path}`, init)
    if (!res.ok) throw new Error(await res.text())
    return (await res.json()) as T
  }

  // Owner endpoints
  list(): Promise<MetricsPage[]> { return this.fetchJson('/api/metrics/pages', { headers: this.headers() }) }
  create(body: Partial<MetricsPage>): Promise<MetricsPage> {
    return this.fetchJson('/api/metrics/pages', { method: 'POST', headers: this.headers(), body: JSON.stringify(body) })
  }
  update(id: string, body: Partial<MetricsPage>): Promise<MetricsPage> {
    return this.fetchJson(`/api/metrics/pages/${id}`, { method: 'PATCH', headers: this.headers(), body: JSON.stringify(body) })
  }
  delete(id: string): Promise<void> {
    return this.fetchJson(`/api/metrics/pages/${id}`, { method: 'DELETE', headers: this.headers() })
  }

  // Public endpoints
  getPublic(slug: string): Promise<MetricsPage> { return this.fetchJson(`/api/public/metrics/${slug}`) }
  getFrequency(slug: string, from?: string, to?: string): Promise<FrequencyResponse> {
    const qs = new URLSearchParams()
    if (from) qs.set('from', from)
    if (to) qs.set('to', to)
    return this.fetchJson(`/api/public/metrics/${slug}/deploy-frequency?${qs.toString()}`)
  }
}
```

Add types to `src/services/types.ts` if shared across components.

## Pages and Components

File layout:

- `src/pages/metrics/MetricsPagesPage.tsx` — list existing pages, “Create page” button, empty state.
- `src/pages/metrics/MetricsPageEditor.tsx` — create/edit form: title, description, slug (readonly/preview), projects multi-select, public toggle.
- `src/pages/metrics/PublicMetricsPage.tsx` — anonymous viewer for `/:slug` showing metadata, chart, totals, and project legend.
- `src/pages/metrics/metrics.loaders.ts` — router loaders/actions for list/create/update/delete.
- `src/pages/metrics/charts/MultiProjectDeployBarChart.tsx` — chart that consumes `FrequencyResponse` and renders bars.

Notes:

- Reuse Recharts like `DeploymentBarChart`. For multiple projects, start with grouped bars; stacked can be a follow-up.
- Use zero-filling for days in the UI as a fallback; server should ideally provide it already.
- Include “Copy link” action on list and editor pages using `navigator.clipboard.writeText`.

## UI/UX Details

- Metrics list
  - Card per page: title, slug, project count, public/private badge, menu: Copy Link, Edit, Delete.
  - Empty state with brief explanation and CTA.
- Editor
  - Slug auto-generated from title; allow override; validate uniqueness via server (surface error near field).
  - Multi-select projects: use `ProjectService.getProjects` to populate options; show selected count.
  - Public toggle with helper text about exposure scope.
  - Save/Cancel; show inline errors from API (e.g., conflict on slug).
- Public viewer
  - Title + description; legend with project names and colors.
  - Date range quick selects: 7d, 30d (default), Custom.
  - Loading skeleton and 404 state if slug not found or `isPublic=false`.

## Data Flow

- Private pages: fetch list via `MetricsPageService.list()` in loader; mutate via actions.
- Public: loader-less component fetches `getPublic` and `getFrequency`. Consider `useEffect` with abort controller.
- Cache frequency response in component state keyed by `from|to`.

## Error Handling

- Map 404/403 on public route to friendly Not Found page.
- Show toast or inline error on create/update failure; surface server messages (slug conflict, invalid projectIds).
- Network timeouts: retry affordance for public viewer.

## i18n

- Add copy to `src/i18n/locales/en.json` under `metricsPages.*` keys.
- Keep labels succinct; reuse existing `Heading`, `Text`, `Badge`, `Button` components.

## Telemetry

- Fire events: `metrics_page_created`, `metrics_page_updated`, `metrics_page_deleted`, `metrics_page_viewed_public` with payloads `{ pageId, projectCount }` or `{ slug }` using existing telemetry utilities.

## Testing

- Service tests (Vitest):
  - Mock `fetch` to validate headers and routes for list/create/update/delete and public endpoints.
- Component tests:
  - Render list with mocked loader data; actions menu interactions.
  - Editor validation (slug error rendering, project selection).
  - Public page renders chart from mocked `FrequencyResponse`.
- Utilities:
  - Zero-fill helper: given range and sparse series, returns continuous dates.

## Rollout Plan

- Ship behind `ENABLE_METRICS_PAGES` flag, disabled by default.
- Internal test with flag override via query param (existing flag system supports URL-coded overrides).
- Once stable, enable by default; keep public route always on (it only reads public data).

## Implementation Steps (Sequence)

1) Add feature flag and nav item (hidden by default).
2) Create `MetricsPageService` with types; wire into `serviceInitialization` if needed.
3) Build private pages: list + create/edit + loaders/actions.
4) Add public route `/m/:slug` and `PublicMetricsPage` with frequency chart.
5) Add chart component for multi-project series; wire date range controls.
6) i18n copy; empty and error states.
7) Tests for services and critical components.
8) Telemetry events and basic performance pass.
9) Enable flag for staged rollout.

## Open Questions

- Should we support stacked vs grouped bars toggle in v1? Default to grouped for clarity.
- Is slug editable after creation? If changed, consider preserving old slugs or return 404 for old links.
- Do we need per-page access tokens for private sharing? Out-of-scope for v1.
- Will frequency endpoint cap the maximum range? If so, reflect that in date picker.

## Rough Visuals (descriptions)

- Metrics List: grid of 2–3 columns of cards; each shows title, slug chip, project count, public badge, kebab menu.
- Editor: 2-column form on desktop (left: inputs, right: help text + example preview); mobile single column.
- Public Viewer: centered content, page title, small description, date range controls right-aligned, full-width chart, legend below.
