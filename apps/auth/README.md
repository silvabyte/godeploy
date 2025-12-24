# Auth

Authentication SPA for GoDeploy. Handles login, signup, and password reset flows via Supabase Auth.

## Development

```bash
# From repo root
bun install

# Start dev server
cd apps/auth && bun dev
# Or: make auth.dev
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

## Tech Stack

- React 19 + TypeScript
- Vite
- Supabase Auth
- TailwindCSS
- React Router

## Environment

Uses the shared Supabase config. See root `.env.example` for required variables.
