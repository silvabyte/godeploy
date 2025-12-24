# CLI

Go CLI for deploying SPAs to GoDeploy. Handles authentication, project initialization, and deployments.

For end-user documentation, see [CLI Usage Guide](../../docs/guides/cli-usage.md).

## Development

```bash
cd apps/cli

# Install dependencies
make cli.deps

# Run tests
make cli.test

# Build for current platform
make cli.build
```

## Scripts (Makefile)

| Command | Description |
|---------|-------------|
| `make cli.test` | Run tests |
| `make cli.test.coverage` | Run tests with coverage |
| `make cli.lint` | Lint with revive |
| `make cli.fmt` | Format code |
| `make cli.build` | Build for current platform (output: `out/`) |
| `make cli.build.all` | Build all platforms (output: `dist/`) |
| `make cli.clean` | Clean build artifacts |

## Project Structure

```
cmd/godeploy/       # Entry point and command definitions
internal/
  api/              # API client
  archive/          # Zip archive creation
  auth/             # Token management (XDG paths)
  cache/            # Local caching
  config/           # Config file handling
  theme/            # Terminal output styling
  version/          # Version info
```

## Building Releases

```bash
# Create a release (bumps version, changelog, tag)
make cli.release.create.patch   # 1.0.5 -> 1.0.6
make cli.release.create.minor   # 1.0.5 -> 1.1.0
make cli.release.create.major   # 1.0.5 -> 2.0.0

# Build binaries and publish
make cli.release.prepare        # Build all platforms
make cli.release.publish        # Deploy to install.godeploy.app
```

## Tech Stack

- Go 1.21+
- [Kong](https://github.com/alecthomas/kong) for CLI parsing
- XDG Base Directory for token storage
