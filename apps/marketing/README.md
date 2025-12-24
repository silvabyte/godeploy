# Marketing

Public marketing site for GoDeploy. Landing page, pricing, and signup flows.

## Development

```bash
# From repo root
bun install

# Start dev server
cd apps/marketing && bun dev
# Or: make marketing.dev
```

Runs at `http://localhost:3000`

## Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Start Next.js dev server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run deploy` | Build and deploy to GoDeploy |
| `bun run typecheck` | Type check |
| `bun run check:fix` | Lint + format (Biome) |

## Tech Stack

- Next.js 14 (static export)
- TypeScript
- TailwindCSS
- HyperDX (telemetry)

## Environment

See root `.env.example` for any required variables.
