#!/bin/bash
set -e

echo "Starting GoDeploy API..."
echo "Environment: ${NODE_ENV:-production}"
echo "Port: ${PORT:-80}"

# Start the application
exec bun run apps/api/src/main.ts
