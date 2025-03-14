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
# Initialize a new configuration file
godeploy init

# Create a new deployment configuration
godeploy deploy

# Start local development server on port 8082
godeploy serve

# Start local development server on a custom port
godeploy serve --port 3000

# Start local development server with a custom Docker image name
godeploy serve --image-name my-custom-spa-server

# Generate deployment files to a custom directory
godeploy deploy --output custom-deploy

# Generate deployment files with a custom config
godeploy --config custom-config.json deploy

# Start local server with custom config
godeploy --config custom-config.json serve
```

| Command                              | Description                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `godeploy init`                      | Creates a default spa-config.json file in the current directory               |
| `godeploy init --force`              | Creates or overwrites the spa-config.json file                                |
| `godeploy deploy`                    | Generates deployment files (Nginx configs, Dockerfile) in `deploy/` directory |
| `godeploy serve`                     | Starts a local Docker container for testing on port 8082                      |
| `godeploy serve --port <port>`       | Starts a local Docker container on the specified port                         |
| `godeploy serve --image-name <name>` | Uses a custom Docker image name instead of the default                        |
| `godeploy --config <file>`           | Uses a custom configuration file instead of `spa-config.json`                 |
| `godeploy deploy --output <dir>`     | Outputs deployment files to a custom directory instead of `deploy/`           |

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

You can generate this file automatically using the `init` command:

```bash
godeploy init
```

### Commands

#### Initialize Configuration

To create a new configuration file:

```bash
godeploy init
```

This will create a default `spa-config.json` file in the current directory. If the file already exists, you can use the `--force` flag to overwrite it:

```bash
godeploy init --force
```

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

To use a different port:

```bash
godeploy serve --port 3000
```

To use a custom Docker image name:

```bash
godeploy serve --image-name my-custom-spa-server
```

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
Usage: godeploy <command> [flags]

A CLI tool for bootstrapping and configuring SPA deployments using Docker and Nginx

Flags:
  -h, --help                        Show context-sensitive help.
      --config="spa-config.json"    Path to the SPA configuration file

Commands:
  serve     Start a local server for testing
    --output="deploy"               Output directory for deployment files
    --port=8082                     Port to run the server on
    --image-name="godeploy-spa-server"  Docker image name
  deploy    Generate deployment files
    --output="deploy"               Output directory for deployment files
  init      Initialize a new spa-config.json file
    -f, --force                     Overwrite existing config file if it exists

Run "godeploy <command> --help" for more information on a command.
```

## Features

- **Local Development**: Quickly serve your SPAs locally for testing
- **Production Deployment**: Generate all necessary files for production deployment
- **Multi-SPA Support**: Host multiple SPAs under a single domain with different paths
- **Automatic Configuration**: Automatically configure Nginx for assets, locales, and routing
- **Docker Integration**: Generate Dockerfile for easy deployment
- **Customizable**: Configure port and Docker image name to avoid conflicts

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
