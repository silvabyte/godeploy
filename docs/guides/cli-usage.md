# CLI Usage Guide

The GoDeploy CLI is a command-line tool for deploying SPAs. This guide covers installation, configuration, and all available commands.

## Installation

### Quick Install (Recommended)

```bash
curl -sSL https://install.godeploy.app/now.sh | bash
```

This installs the latest version to `~/.local/bin/godeploy`.

### Manual Installation

Download the appropriate binary from the [releases page](https://github.com/silvabyte/godeploy-api/releases):

| Platform | Architecture  | File                            |
| -------- | ------------- | ------------------------------- |
| Linux    | x86_64        | `godeploy-linux-x86_64.tar.gz`  |
| Linux    | ARM64         | `godeploy-linux-arm64.tar.gz`   |
| macOS    | Intel         | `godeploy-darwin-x86_64.tar.gz` |
| macOS    | Apple Silicon | `godeploy-darwin-arm64.tar.gz`  |
| Windows  | x86_64        | `godeploy-windows-x86_64.zip`   |

Extract and add to your PATH:

```bash
tar -xzf godeploy-linux-x86_64.tar.gz
sudo mv godeploy /usr/local/bin/
```

### Verify Installation

```bash
godeploy version
```

## Authentication

### Create an Account

```bash
godeploy auth sign-up
```

You'll be prompted for email and password. A verification email will be sent.

### Sign In

```bash
godeploy auth login
```

### Check Status

```bash
godeploy auth status
```

Output:

```
Authenticated as: user@example.com
Token expires: 2024-01-01 12:00:00
```

### Sign Out

```bash
godeploy auth logout
```

## Project Configuration

### Initialize a Project

```bash
cd your-spa-project
godeploy init
```

This creates a `godeploy.config.json` file:

```json
{
  "apps": [
    {
      "name": "my-app",
      "source_dir": "dist",
      "description": "My awesome SPA",
      "enabled": true
    }
  ]
}
```

### Configuration Options

| Field         | Type    | Description                      |
| ------------- | ------- | -------------------------------- |
| `name`        | string  | Project name (becomes subdomain) |
| `source_dir`  | string  | Build output directory           |
| `description` | string  | Optional project description     |
| `enabled`     | boolean | Whether to deploy this app       |

### Multi-App Configuration

Deploy multiple SPAs from one repository:

```json
{
  "apps": [
    {
      "name": "main-app",
      "source_dir": "apps/main/dist",
      "enabled": true
    },
    {
      "name": "admin-app",
      "source_dir": "apps/admin/dist",
      "enabled": true
    },
    {
      "name": "docs",
      "source_dir": "docs/build",
      "enabled": false
    }
  ]
}
```

## Deploying

### Basic Deploy

```bash
# Build your app first
npm run build

# Deploy all enabled apps
godeploy deploy
```

### Deploy Specific App

```bash
godeploy deploy --project main-app
```

### Deploy with Git Metadata

The CLI automatically detects git information:

```bash
godeploy deploy
# Automatically includes: commit SHA, branch, message, URL
```

Disable auto-detection:

```bash
godeploy deploy --no-git
```

Override git metadata:

```bash
godeploy deploy \
  --commit-sha abc123 \
  --commit-branch main \
  --commit-message "feat: new feature" \
  --commit-url "https://github.com/..."
```

### Deploy Timeout

Default timeout is 10 minutes. Override with environment variable:

```bash
GODEPLOY_DEPLOY_TIMEOUT=20m godeploy deploy
```

## Command Reference

### godeploy

```
Usage:
  godeploy <command> [flags]

Commands:
  init        Initialize project configuration
  deploy      Deploy your SPA
  auth        Authentication commands
  version     Show version information

Flags:
  -h, --help  Show help
```

### godeploy init

```
Initialize a new godeploy.config.json file

Usage:
  godeploy init [flags]

Flags:
  -h, --help  Show help
```

### godeploy deploy

```
Deploy your SPA to GoDeploy

Usage:
  godeploy deploy [flags]

Flags:
  --project string        Deploy specific project by name
  --commit-sha string     Git commit SHA
  --commit-branch string  Git branch name
  --commit-message string Git commit message
  --commit-url string     URL to commit
  --no-git                Disable git auto-detection
  -h, --help              Show help

Environment:
  GODEPLOY_DEPLOY_TIMEOUT  Deploy timeout (default: 10m)
```

### godeploy auth

```
Authentication commands

Usage:
  godeploy auth <command> [flags]

Commands:
  sign-up  Create a new account
  login    Sign in to your account
  logout   Sign out
  status   Check authentication status

Flags:
  -h, --help  Show help
```

### godeploy version

```
Show version information

Usage:
  godeploy version [flags]

Flags:
  -h, --help  Show help
```

## Token Storage

Tokens are stored in an XDG-compliant location:

```
~/.config/godeploy/config.json
```

The CLI automatically refreshes tokens when they expire.

### Legacy Migration

If you have tokens in the old location (`~/.godeploy/`), they will be automatically migrated on first use.

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Install GoDeploy CLI
        run: curl -sSL https://install.godeploy.app/now.sh | bash

      - name: Deploy
        run: godeploy deploy
        env:
          GODEPLOY_ACCESS_TOKEN: ${{ secrets.GODEPLOY_ACCESS_TOKEN }}
```

### GitLab CI

```yaml
deploy:
  stage: deploy
  image: node:20
  script:
    - npm ci
    - npm run build
    - curl -sSL https://install.godeploy.app/now.sh | bash
    - godeploy deploy
  variables:
    GODEPLOY_ACCESS_TOKEN: $GODEPLOY_ACCESS_TOKEN
  only:
    - main
```

## Troubleshooting

### "Unauthorized" Error

```bash
# Check auth status
godeploy auth status

# Re-authenticate
godeploy auth logout
godeploy auth login
```

### "Project not found" Error

1. Verify `godeploy.config.json` exists
2. Check project name matches
3. Ensure project is created in dashboard

### Deploy Timeout

Increase timeout:

```bash
GODEPLOY_DEPLOY_TIMEOUT=30m godeploy deploy
```

### Large File Upload Issues

- Maximum upload size: 500MB
- Ensure `source_dir` only contains build output
- Exclude unnecessary files (node_modules, etc.)

### Connection Issues

```bash
# Check API connectivity
curl -I https://api.godeploy.app/health
```

## Related Documentation

- [API Reference](../api/reference.md) - REST API documentation
- [Authentication](../api/authentication.md) - Auth flow details
- [Custom Domains](custom-domains.md) - Domain configuration
