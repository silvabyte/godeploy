# GoDeploy Examples

This directory contains examples demonstrating how to use GoDeploy for both single and multi-app deployments.

## Multi-App Demo

The multi-app demo showcases how to deploy multiple frontend applications with different routing paths.

```bash
cd multi-app

# Run using locally built binary
make run-demo-local

# Or run using installed godeploy
make run-demo
```

### Multi-App Structure

- `/` - Home application
- `/dashboard` - Dashboard application
- `/auth` - Authentication application

## Single-App Demo

The single-app demo shows how to deploy a basic single-page application.

```bash
cd single-app

# Run using locally built binary
make run-demo-local

# Or run using installed godeploy
make run-demo
```

## Prerequisites

- Node.js and npm (for building frontend applications)
- Go 1.21 or later (for building from source)
- Make

## Notes

- `run-demo-local` builds godeploy from source and runs the demo
- `run-demo` uses the installed version of godeploy (will auto-install if not present)
- The multi-app demo requires building all frontend applications before running
- Configuration for each demo can be found in their respective directories
