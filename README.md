# GoDeploy - SPA Deployment Tool

[![Release: Automated with xrelease](https://img.shields.io/badge/Release-Automated%20with%20xrelease-blueviolet?logo=github&logoColor=white)](https://github.com/matsilva/xrelease)

GoDeploy is a simple tool that helps frontend developers deploy Single Page Applications (SPAs) using Docker and Nginx. It takes your built SPA files and creates a ready-to-deploy Docker container.

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

## Quick Start for Frontend Developers

### 1. Build your SPA

First, build your SPA using your framework's build command:

```bash
# For React
npm run build
# or for Vue/Angular
npm run build
```

This typically creates a `dist` or `build` directory with your compiled assets.

### 2. Initialize GoDeploy

In your project root (where your build directory is located):

```bash
godeploy init
```

This creates a `spa-config.json` file. Open it and update it with your app's information:

```json
{
  "default_app": "myapp",
  "apps": [
    {
      "name": "myapp",
      "source_dir": "dist", // or "build" for React
      "description": "My awesome SPA",
      "enabled": true
    }
  ]
}
```

### 3. Test Locally

Run your SPA in a local Docker container:

```bash
godeploy serve
```

Your app will be available at http://localhost:8082/

### 4. Generate Deployment Files

When you're ready to deploy:

```bash
godeploy deploy
```

This creates a `deploy` directory with everything needed to deploy your app:

- Nginx configuration
- Dockerfile
- Your SPA files

### 5. Deploy

You can now deploy the contents of the `deploy` directory to any Docker-compatible hosting service:

```bash
cd deploy
docker build -t myapp .
docker run -p 80:80 myapp
```

## Common Options

- Change the port: `godeploy serve --port 3000`
- Use a custom Docker image name: `godeploy serve --image-name my-custom-image`
- Use a different output directory: `godeploy deploy --output my-deploy-files`

## Features

- **Simple Setup**: Get your SPA running in Docker with minimal configuration
- **Local Testing**: Test your Docker deployment locally before pushing to production
- **Production Ready**: Generate optimized Nginx configurations for your SPA
- **Asset Handling**: Proper cache headers and handling of hashed filenames
- **Localization Support**: Automatic handling of locale files

## Requirements

- Go 1.16 or later
- Docker (for local serving and deployment)

## Advanced Configuration

For advanced usage including multi-SPA configuration, custom Nginx settings, and more detailed command options, see the [Advanced Configuration Guide](docs/advanced-configuration.md).

## License

MIT
