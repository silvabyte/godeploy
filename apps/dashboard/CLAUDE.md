Here’s your updated `CLAUDE.md` instructions file—clean, concise, and free of emojis. I also incorporated the Supabase and auth/session info as requested:

---

# `CLAUDE.md`

Guidelines for Claude Code when working in this repo.

---

## Build & Test

```bash
pnpm dev      # start dev server
pnpm build    # build for production
pnpm test     # run all tests
```

---

## Stack Overview

- **Language**: TypeScript
- **Frontend**: React (functional, typed props)
- **Router**: React Router v6.30+ (`createRouter`, `loader`, `action`)
- **State**: MobX (used for shared app-wide state only)
- **Styling**: TailwindCSS v4
- **Testing**: Vitest + React Testing Library
- **i18n**: `@matsilva/xtranslate`
- **Auth**: Located in `src/services/auth`
- **DB Types**: SupabaseJS, types defined in `src/services/database.types.ts`

---

## Import Rules

- No default exports
- No barrel files
- Group: built-ins → external libs → local modules

---

## Code Style

- `PascalCase`: components, interfaces
- `camelCase`: variables, functions
- `UPPER_SNAKE_CASE`: constants
- Co-locate types and utilities near usage

---

## Error Handling

- Use `await-to-js` for async/await
- Use React error boundaries in UI

---

## Desired App Folder Structure

```
src/
├── assets/         # Static files (fonts, images)
├── components/     # UI (basic, composites, layouts, boundaries)
├── lib/            # constants, utils, hooks, store, types
├── pages/          # domain-specific app views
├── routes/         # route modules (loader, action, element)
├── services/       # API logic (auth, users, file storage)
├── styles/         # global styles
├── index.tsx       # React root
├── App.tsx         # App shell
```
