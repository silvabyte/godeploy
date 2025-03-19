#!/bin/bash
# Load environment variables from .env
set -o allexport
source .env || { echo "No .env file found. Exiting."; exit 1; }
set +o allexport

HYPERDX_API_KEY=$HYPERDX_API_KEY OTEL_SERVICE_NAME=$OTEL_SERVICE_NAME node_modules/.bin/tsx -r '@hyperdx/node-opentelemetry/build/src/tracing' src/main.ts