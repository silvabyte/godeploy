# GoDeploy - SPA Deployment CLI

GoDeploy is a command-line tool for bootstrapping and configuring Single Page Application (SPA) deployments using Docker and Nginx. It simplifies the process of setting up a multi-SPA server where multiple SPAs can be hosted under a single domain with different paths.

## Installation

```bash
go install github.com/audetic/godeploy/cmd/godeploy@latest
```

Or build from source:

```bash
git clone https://github.com/audetic/godeploy.git
cd godeploy
go build -o godeploy ./cmd/godeploy
```

## Quick Start

Here's a quick reference of common commands and their purposes:

```bash
# Create a new deployment configuration
godeploy -config spa-config.json deploy

# Start local development server on port 8082
godeploy serve

# Generate deployment files to a custom directory
godeploy -output custom-deploy deploy

# Generate deployment files with a custom config
godeploy -config custom-config.json deploy

# Start local server with custom config
godeploy -config custom-config.json serve
```

| Command                   | Description                                                                   |
| ------------------------- | ----------------------------------------------------------------------------- |
| `godeploy deploy`         | Generates deployment files (Nginx configs, Dockerfile) in `deploy/` directory |
| `godeploy serve`          | Starts a local Docker container for testing on port 8082                      |
| `godeploy -config <file>` | Uses a custom configuration file instead of `spa-config.json`                 |
| `godeploy -output <dir>`  | Outputs deployment files to a custom directory instead of `deploy/`           |

## Usage

### Configuration

Create a `spa-config.json` file to define your SPAs:

```json
{
  "default_app": "auth",
  "apps": [
    {
      "name": "auth",
      "source_dir": "dist",
      "description": "Authentication application",
      "enabled": true
    },
    {
      "name": "dashboard",
      "source_dir": "dashboard-dist",
      "description": "User dashboard application",
      "enabled": false
    }
  ]
}
```

### Commands

#### Serve Locally

To serve your SPAs locally for testing:

```bash
godeploy serve
```

This will:

1. Generate Nginx configuration files
2. Build a Docker image with your SPAs
3. Run the Docker container locally on port 8082

You can access your SPAs at:

- Default app: http://localhost:8082/
- Specific app: http://localhost:8082/[app-name]/

#### Generate Deployment Files

To generate files for production deployment:

```bash
godeploy deploy
```

This will create a `deploy` directory with:

- Nginx configuration files
- Dockerfile
- All your SPAs with proper configuration

You can then deploy these files to your cloud provider of choice.

### Options

```
Usage: godeploy [options] <command>

Options:
  -config string
        Path to the SPA configuration file (default "spa-config.json")
  -output string
        Output directory for deployment files (default "deploy")

Commands:
  serve    Start a local server for testing
  deploy   Generate deployment files

For command-specific help, run: godeploy <command> -h
```

## Features

- **Local Development**: Quickly serve your SPAs locally for testing
- **Production Deployment**: Generate all necessary files for production deployment
- **Multi-SPA Support**: Host multiple SPAs under a single domain with different paths
- **Automatic Configuration**: Automatically configure Nginx for assets, locales, and routing
- **Docker Integration**: Generate Dockerfile for easy deployment

## How It Works

1. **Configuration-Driven Approach**:

   - Each SPA is defined in `spa-config.json` with a name, source directory, and enabled status
   - The default app is specified in the configuration

2. **Automatic Asset Handling**:

   - The tool processes each SPA's assets (JS, CSS) and creates Nginx configurations
   - Hashed filenames (e.g., `index-CgbRfOA8.js`) are properly mapped for cache optimization

3. **Path-Based Routing**:

   - Each SPA is accessible at its own path (e.g., `/auth/`, `/dashboard/`)
   - Root path (`/`) redirects to the default app

4. **Locales Support**:
   - Localization files are served from `/[app-name]/locales/`
   - Fallback routes redirect requests from `/locales/` to the appropriate app path

## Requirements

- Go 1.16 or later
- Docker (for local serving and deployment)

## License

MIT
