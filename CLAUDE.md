# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Build/Run: `npm run dev` (development with watch), `npm run start` (production)
- Test: `npm test` (all tests), `npx vitest src/path/to/test.test.ts` (single test)
- Smoke Tests: `npm run test:smoke`, `npm run test:auth`
- Format: `npm run format`
- Database: `npm run db:new` (create migration), `npm run db:up` (apply), `npm run db:push` (to Supabase)

## Code Style

- TypeScript with strict type checking and ESM modules
- Use `Result<T>` pattern for error handling (`{ error: string | null, data: T | null }`)
- Use await-to-js to convert 3rd party async operations to [error, data]
- Type imports with `import type { X } from 'y'`
- Class-based services with descriptive method names
- Use async/await for promises
- Conventional commits (feat, fix, chore, etc.)
- Fastify routes and plugins using autoload (src/app/build/autoload.ts)
- Use zod for type defintions
- Use zodToJsonSchema to convert type definaitons to json schemas, for fastify
- Fastify route handlers with explicit type definitions and schema validation
- Fastify plugins using fastify-plugin
- Prefer early returns for error conditions
- Use nullable types with `!` assertion only when guaranteed
- Use .prettierrc for formatting
- Vitest for unit tests.
