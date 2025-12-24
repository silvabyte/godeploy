# Dashboard

Main management dashboard for GoDeploy. Users manage projects, view deploy history, configure domains, and monitor analytics.

## Development

```bash
# From repo root
bun install

# Start dev server
cd apps/dashboard && bun dev
# Or: make dashboard.dev
```

Runs at `http://localhost:5173`

## Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start dev server with HMR |
| `bun run build` | Production build to `dist/` |
| `bun test` | Run tests |
| `bun run typecheck` | Type check |
| `bun run check:fix` | Lint + format (Biome) |
| `bun run generate:types` | Regenerate Supabase types |

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router (loaders/actions pattern)
- Supabase client
- TailwindCSS
- Headless UI + Heroicons
- Recharts (analytics)
- MobX (state)

## Environment

Uses the shared Supabase config. See root `.env.example` for required variables.
