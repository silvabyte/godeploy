# Makefile System Documentation

This repository uses a comprehensive Makefile system to manage development, build, test, and deployment tasks across all apps in the monorepo.

## Quick Start

```bash
# Show all available commands
make help

# Show version information
make version

# Run tests for all apps
make test-all

# Run specific app command
make api.dev
make auth.build
make dashboard.test
make cli.build.all
```

## Structure

The Makefile system is organized as follows:

```
Makefile                    # Root orchestrator with global commands
makefiles/
├── common.mk               # Shared variables, colors, helper functions
├── db.mk                   # Database operations (Supabase)
├── api/
│   ├── dev.mk             # API dev, test, lint, typecheck
│   ├── build.mk           # API Docker build
│   └── deploy.mk          # API Docker deploy operations
├── auth/
│   ├── dev.mk             # Auth dev, test, lint, typecheck
│   ├── build.mk           # Auth Vite build
│   └── deploy.mk          # Auth godeploy deployment
├── dashboard/
│   ├── dev.mk             # Dashboard dev, test, lint, typecheck
│   ├── build.mk           # Dashboard Vite build
│   └── deploy.mk          # Dashboard godeploy deployment
├── marketing/
│   ├── dev.mk             # Marketing dev, lint, typecheck
│   ├── build.mk           # Marketing Next.js build
│   └── deploy.mk          # Marketing godeploy deployment
└── cli/
    ├── dev.mk             # CLI test, lint, format
    ├── build.mk           # CLI Go build (all platforms)
    └── deploy.mk          # CLI release operations
```

## Command Patterns

### Namespaced Commands

All app-specific commands follow the pattern: `make <app>.<command>`

#### API Commands
```bash
make api.dev              # Start API dev server with hot reload
make api.start            # Start API in production mode
make api.test             # Run API tests
make api.test.watch       # Run tests in watch mode
make api.test.coverage    # Run tests with coverage
make api.typecheck        # TypeScript type checking
make api.lint             # Lint code
make api.lint.fix         # Lint and auto-fix
make api.fmt              # Format code
make api.clean            # Clean build artifacts

# Docker operations
make api.build            # Build Docker image
make api.docker.run       # Run Docker container
make api.docker.stop      # Stop Docker container
make api.docker.logs      # Follow container logs
make api.deploy           # Full deploy (stop, build, run)
```

#### Auth Commands
```bash
make auth.dev             # Start auth dev server
make auth.test            # Run auth tests
make auth.test.watch      # Run tests in watch mode
make auth.typecheck       # TypeScript type checking
make auth.lint            # Lint code
make auth.fmt             # Format code
make auth.build           # Build for production
make auth.deploy          # Deploy to godeploy
make auth.clean           # Clean build artifacts
```

#### Dashboard Commands
```bash
make dashboard.dev        # Start dashboard dev server
make dashboard.test       # Run dashboard tests
make dashboard.typecheck  # TypeScript type checking
make dashboard.lint       # Lint code
make dashboard.fmt        # Format code
make dashboard.knip       # Find unused exports
make dashboard.build      # Build for production
make dashboard.deploy     # Deploy to godeploy
make dashboard.clean      # Clean build artifacts
```

#### Marketing Commands
```bash
make marketing.dev        # Start marketing dev server
make marketing.start      # Start production server
make marketing.typecheck  # TypeScript type checking
make marketing.lint       # Lint code with biome
make marketing.lint.next  # Lint with Next.js linter
make marketing.fmt        # Format code
make marketing.build      # Build with Next.js
make marketing.deploy     # Deploy to godeploy
make marketing.clean      # Clean build artifacts
```

#### CLI Commands
```bash
make cli.test             # Run Go tests
make cli.test.coverage    # Run tests with coverage
make cli.lint             # Run Go linters
make cli.lint.fix         # Auto-fix Go code
make cli.fmt              # Format Go code
make cli.deps             # Install Go dependencies

# Build commands
make cli.build            # Build for current platform
make cli.build.linux      # Build for Linux x86_64
make cli.build.arm64      # Build for Linux ARM64
make cli.build.mac        # Build for macOS Intel
make cli.build.mac.arm64  # Build for macOS Apple Silicon
make cli.build.windows    # Build for Windows
make cli.build.all        # Build for all platforms

# Release commands
make cli.version          # Show CLI version
make cli.release          # Create release builds
make cli.deploy           # Build all platform packages
```

### Database Commands
```bash
make db.new [name]        # Create new migration
make db.up                # Apply pending migrations
make db.push              # Push migrations to remote
make db.pull              # Pull schema from remote
make db.reset             # Reset local database (WARNING: destructive)
make db.status            # Show migration status
```

### Global Commands
```bash
make help                 # Show help with all commands
make version              # Show version info for all apps
make install              # Install all dependencies
make clean-all            # Clean all build artifacts
make test-all             # Run all tests
make lint-all             # Lint all apps
make typecheck-all        # Type check all TypeScript apps
make fmt-all              # Format all apps
make build-all            # Build all apps
make check-all            # Run biome check on all apps
```

### Workspace Commands
```bash
make workspace.lint       # Lint entire workspace with biome
make workspace.fmt        # Format entire workspace
make workspace.check      # Check entire workspace
make workspace.check.fix  # Check and fix entire workspace
make workspace.knip       # Run knip on entire workspace
```

## Design Philosophy

### Complementary to Bun
The Makefile system **complements** the existing `package.json` scripts rather than replacing them. All commands delegate to bun/bunx for consistency:

```makefile
# Makefile calls bun workspace scripts
api.test:
    @bun run --filter @godeploy/api test
```

This approach:
- Preserves existing package.json scripts
- Leverages bun's workspace filtering
- Provides consistent command-line interface
- Adds color-coded output and progress messages

### Modular Architecture
Each app has three separate makefiles:
- `dev.mk` - Development tasks (dev, test, lint, typecheck)
- `build.mk` - Build operations (compile, bundle, package)
- `deploy.mk` - Deployment tasks (docker, godeploy, releases)

This separation makes it easy to:
- Find relevant commands
- Maintain and extend functionality
- Understand the purpose of each command

### Colored Output
The system uses ANSI color codes for clear, readable output:
- 🔵 Blue (cyan) - Headers and section titles
- ✓ Green - Success messages
- ⚠️ Yellow - Warnings
- ✗ Red - Errors
- ℹ️ Blue - Info messages

## Common Workflows

### Starting Development
```bash
# Start API dev server
make api.dev

# Start auth app
make auth.dev

# Start dashboard
make dashboard.dev

# Start marketing site
make marketing.dev
```

### Running Tests
```bash
# Test single app
make api.test

# Test all apps
make test-all

# Watch mode for development
make api.test.watch
```

### Building for Production
```bash
# Build single app
make auth.build

# Build all apps
make build-all

# Build CLI for all platforms
make cli.build.all
```

### Code Quality
```bash
# Lint all code
make lint-all

# Format all code
make fmt-all

# Type check all TypeScript
make typecheck-all

# Full workspace check
make workspace.check
```

### Deployment
```bash
# Deploy frontend apps
make auth.deploy
make dashboard.deploy
make marketing.deploy

# Deploy API via Docker
make api.deploy

# Create CLI release packages
make cli.release
```

## Integration with Existing Tools

The Makefile system works alongside:
- **Bun workspaces** - All commands use `bun run --filter`
- **package.json scripts** - Makefile calls existing scripts
- **Biome** - Linting and formatting via bunx
- **Vitest** - Test runner for TypeScript apps
- **Docker** - Container builds for API
- **Go toolchain** - CLI builds and tests
- **Supabase CLI** - Database migrations

## Extending the System

To add new commands:

1. **Add to app-specific makefile**: Edit `makefiles/<app>/<category>.mk`
2. **Follow naming convention**: Use `<app>.<command>` pattern
3. **Add documentation**: Include `## Comment` for help text
4. **Use helpers**: Leverage `print_header`, `print_success` from common.mk

Example:
```makefile
# In makefiles/api/dev.mk
api.custom: ## My custom API command
	$(call print_header,"Running custom command")
	@cd $(API_DIR) && bun run custom-script
	$(call print_success,"Command completed")
```

## Troubleshooting

### Command not found
```bash
# Ensure you're in project root
cd /path/to/godeploy-api

# Verify Makefile exists
ls -la Makefile makefiles/
```

### Go commands fail (CLI)
```bash
# Install Go dependencies first
make cli.deps

# Verify Go installation
go version
```

### Bun commands fail
```bash
# Install bun dependencies
make install
# or
bun install
```

### Color codes show as text
Your terminal may not support ANSI colors. The commands still work, just without colors.

## Tips

- Use tab completion: `make api.<TAB>` to see available commands
- Chain commands: `make api.clean api.build api.test`
- Check help often: `make help` shows all commands with descriptions
- Use workspace commands for repo-wide operations
- App-specific commands for focused work

