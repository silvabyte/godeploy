#!/bin/bash
HYPERDX_API_KEY=$HYPERDX_API_KEY OTEL_SERVICE_NAME=$OTEL_SERVICE_NAME bun --preload '@hyperdx/node-opentelemetry/build/src/tracing' src/main.ts