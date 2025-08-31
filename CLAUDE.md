# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Runtime

This project uses **Bun** as the JavaScript runtime and package manager.

## Commands

- Build/Run: `bun dev` (development with watch), `bun start` (production)
- Test: `bun test` (all tests), `bun test src/path/to/test.test.ts` (single test)
- Smoke Tests: `bun run test:smoke`, `bun run test:auth`
- Format: `bun run format` (format code with Biome)
- Lint: `bun run lint` (check), `bun run lint:fix` (fix issues)
- Check: `bun run check` (lint + format check), `bun run check:fix` (fix all)
- Type Check: `bun run typecheck`
- Dead Code: `bun run knip` (find unused code), `bun run knip:fix` (remove unused files)
- Database: `bun run db:new` (create migration), `bun run db:up` (apply), `bun run db:push` (to Supabase)
- Install: `bun install` (install dependencies)

## Code Style

- TypeScript with strict type checking and ESM modules
- Use `Result<T>` pattern for error handling (`{ error: string | null, data: T | null }`)
- Use await-to-js to convert 3rd party async operations to [error, data]
- Type imports with `import type { X } from 'y'`
- Class-based services with descriptive method names
- Use async/await for promises
- Conventional commits (feat, fix, chore, etc.)
- Fastify routes and plugins using explicit registration (src/app/build/register.ts)
- Use zod for type defintions
- Use zodToJsonSchema to convert type definaitons to json schemas, for fastify
- Fastify route handlers with explicit type definitions and schema validation
- Fastify plugins using fastify-plugin
- Prefer early returns for error conditions
- Use nullable types with `!` assertion only when guaranteed
- Use Biome for formatting and linting (biome.json configuration)
- Bun test for unit tests (migrating from Vitest)
