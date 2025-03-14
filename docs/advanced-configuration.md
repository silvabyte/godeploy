# Advanced Configuration for GoDeploy

This document covers advanced configuration options and use cases for GoDeploy.

## Multi-SPA Configuration

GoDeploy can host multiple SPAs under a single domain with different paths. This is configured through the `spa-config.json` file:

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
      "enabled": true
    }
  ]
}
```

With this configuration:

- The default app (`auth`) will be accessible at `/` and `/auth/`
- The dashboard app will be accessible at `/dashboard/`

## Command Line Options

### Global Options

```
--config="spa-config.json"    Path to the SPA configuration file
```

### Serve Command Options

```
godeploy serve [options]
  --output="deploy"               Output directory for deployment files
  --port=8082                     Port to run the server on
  --image-name="godeploy-spa-server"  Docker image name
```

### Deploy Command Options

```
godeploy deploy [options]
  --output="deploy"               Output directory for deployment files
```

### Init Command Options

```
godeploy init [options]
  -f, --force                     Overwrite existing config file if it exists
```

## Complete Command Reference

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

## Technical Details

### How It Works

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

### Nginx Configuration

GoDeploy automatically generates Nginx configuration files that handle:

- Routing to the correct SPA based on the URL path
- Serving static assets with proper cache headers
- Handling localization files
- Redirecting the root path to the default app

### Docker Configuration

The generated Dockerfile:

- Uses nginx:1.13-alpine as the base image
- Installs necessary tools (bash, curl, jq)
- Copies the Nginx configuration
- Copies all SPAs to the appropriate directories
- Exposes port 80
- Starts Nginx
