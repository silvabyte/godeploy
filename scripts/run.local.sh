#!/bin/bash
# Bun automatically loads .env files
set -e

echo "Starting GoDeploy API (local)..."
echo "Environment: ${NODE_ENV:-development}"

# Start the application
exec bun run apps/api/src/main.ts
