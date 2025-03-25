# GoDeploy CLI Architecture Overview

## 1. Project Structure

### 1.1 Core Directories

- `cmd/godeploy/` – CLI entry point
- `internal/` – Core functionality packages
  - `api/` – API client integration
  - `auth/` – Authentication and session management
  - `config/` – Configuration handling
  - `docker/` – Docker containerization support
  - `nginx/` – Nginx setup and configuration
  - `archive/` – Asset packaging utilities
- `examples/` – Practical usage examples
  - `multi-app/` – Multi-application deployments
  - `single-app/` – Single-application deployments
- `docs/` – Documentation resources
- `install/` – Installation scripts
- `godeploy-extract/` – Utilities for asset extraction

### 1.2 Configuration Files

- `go.mod` – Go module definitions
- `go.sum` – Dependency checksums
- `godeploy.config.json` – CLI configuration file
- `Makefile` – Build automation
- `.xrelease.yml` – Automated release configuration

## 2. Core Features

### 2.1 Self-Hosted Mode

- **Initialization** (`godeploy init`)
  - Project setup and default configurations
- **Local Development** (`godeploy serve`)
  - Docker-based local preview with hot reloading
- **Packaging** (`godeploy package`)
  - Dockerfile and Nginx configuration generation
  - Asset bundling for deployment

### 2.2 SaaS Mode

- **Authentication** (`godeploy auth login`)
  - Magic link authentication flow
  - Secure session and token handling
- **Deployment** (`godeploy deploy`)
  - Cloud asset uploads and CDN integration
  - Automatic deployment URL generation

## 3. Core Packages

### 3.1 API Package (`internal/api/`)

- REST client functionality
- Request handling, error management, rate limiting

### 3.2 Auth Package (`internal/auth/`)

- Authentication workflows
- Session lifecycle management and secure credential storage

### 3.3 Config Package (`internal/config/`)

- Configuration parsing, validation, and defaults
- Environment-based configuration handling

### 3.4 Docker Package (`internal/docker/`)

- Container and image management
- Docker environment setup and port/volume mapping

### 3.5 Nginx Package (`internal/nginx/`)

- Nginx configuration and routing rules
- SSL/TLS and caching setup

### 3.6 Archive Package (`internal/archive/`)

- Asset compression and directory bundling
- Optimization and cleanup utilities

## 4. Configuration System

### 4.1 Configuration File Structure

```json
{
  "apps": [
    {
      "name": "app-name",
      "source_dir": "dist",
      "path": "/",
      "description": "App description",
      "enabled": true
    }
  ]
}
```

### 4.2 Configuration Features

- Support for multiple applications
- Custom routing paths
- Build output directory mappings

## 5. Development Tools

### 5.1 Build System

- Go (1.16+)
- Cross-platform binary compilation
- Makefile automation

### 5.2 Testing

- Comprehensive unit and integration tests
- Example-driven validation
- Mock implementations for external dependencies

### 5.3 Code Quality

- Go linting and format checking
- Automated documentation
- Version management

## 6. Deployment Modes

### 6.1 Self-Hosted

- Docker-based deployments
- Full infrastructure control
- Manual management and scaling

### 6.2 SaaS

- Automated infrastructure provisioning
- CDN-backed performance
- Managed scaling and hosting

## 7. Security

### 7.1 Authentication

- Secure magic link authentication
- Token security and session handling

### 7.2 File Handling

- Secure asset operations
- Validated file paths and content verification
- Safe asset cleanup
