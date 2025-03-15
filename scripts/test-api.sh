#!/bin/bash

# Test the health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:3000/health | jq

# Test the projects endpoint
echo "Testing projects endpoint..."
curl -s http://localhost:3000/api/projects-public | jq

# Create a test SPA archive
echo "Creating test SPA archive..."
mkdir -p test-spa
echo "<html><body><h1>Hello GoDeploy!</h1></body></html>" > test-spa/index.html
zip -r test-spa.zip test-spa

# Test the deploy endpoint
echo "Testing deploy endpoint..."
curl -s -X POST \
  -F "archive=@test-spa.zip" \
  "http://localhost:3000/api/deploy-public?project=test-app" | jq

# Clean up
rm -rf test-spa test-spa.zip 