# Contributing to GoDeploy

Thanks for your interest in contributing! This document provides a quick overview. For detailed guidelines, see [docs/development/contributing.md](docs/development/contributing.md).

## Quick Start

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/godeploy-api.git
cd godeploy-api

# Install dependencies
bun install

# Set up environment
cp .env.example .env

# Start local Supabase
supabase start

# Apply migrations
bun db:up

# Start development
bun dev
```

See [Development Setup](docs/development/setup.md) for full instructions.

## Making Changes

1. Create a branch: `git checkout -b feature/your-feature`
2. Make changes
3. Run tests: `bun test`
4. Run linting: `make all.check.fix`
5. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: add feature"`
6. Push and open a PR

## Commit Message Format

```
<type>(<scope>): <description>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

- `feat(api): add custom domain support`
- `fix(cli): handle token refresh`
- `docs(readme): update installation`

## Code Style

- TypeScript: No default exports, PascalCase for types, camelCase for functions
- Go: Follow Effective Go, use gofmt
- Use Biome for formatting: `make all.fmt`

## Need Help?

- [Development Setup](docs/development/setup.md)
- [Contributing Guide](docs/development/contributing.md)
- [Architecture Overview](docs/architecture/overview.md)
- Open an issue for questions
