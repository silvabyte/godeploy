# GoDeploy Releases

This directory contains release artifacts for the GoDeploy CLI.

## Directory Structure

```
releases/
├── latest.txt                           # Contains the current version (e.g., v1.0.5)
└── {version}/                           # Version-specific directory
    ├── godeploy-darwin-amd64.tar.gz    # macOS Intel binary
    ├── godeploy-darwin-arm64.tar.gz    # macOS Apple Silicon binary
    ├── godeploy-linux-amd64.tar.gz     # Linux x86_64 binary
    ├── godeploy-linux-arm64.tar.gz     # Linux ARM64 binary
    └── godeploy-windows-amd64.zip      # Windows x86_64 binary
```

## Release Process

When releasing a new version:

1. **Build all binaries**:
   ```bash
   cd apps/cli
   make build-all
   ```
   This creates archives in the `dist/` directory.

2. **Create version directory**:
   ```bash
   mkdir -p install/releases/v{VERSION}
   ```

3. **Copy artifacts**:
   ```bash
   cp dist/*.tar.gz dist/*.zip install/releases/v{VERSION}/
   ```

4. **Update latest version**:
   ```bash
   echo "v{VERSION}" > install/releases/latest.txt
   ```

5. **Deploy to install.godeploy.com**:
   ```bash
   godeploy deploy
   ```

## Installation URL

Users install GoDeploy via:

```bash
curl -sSL https://install.godeploy.com/now.sh | bash
```

The install script automatically:
- Fetches the latest version from `https://install.godeploy.com/releases/latest.txt`
- Downloads the appropriate binary from `https://install.godeploy.com/releases/{version}/godeploy-{os}-{arch}.{ext}`
- Installs to `/usr/local/bin/godeploy` (or user-specified `PREFIX`)

## Specific Version Installation

Users can install a specific version by setting the `VERSION` environment variable:

```bash
curl -sSL https://install.godeploy.com/now.sh | VERSION=v1.0.4 bash
```

