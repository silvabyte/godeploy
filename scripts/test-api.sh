#!/bin/bash

# Load environment variables if .env file exists
if [ -f .env ]; then
  source .env
fi

# Set text colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if GODEPLOY_ACCESS_TOKEN is set
if [ -z "$GODEPLOY_ACCESS_TOKEN" ]; then
  echo -e "${RED}GODEPLOY_ACCESS_TOKEN is not set in .env file. Please set it and try again.${NC}"
  exit 1
fi

# Check if the server is running
echo -e "${BLUE}Checking if the server is running...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)

if [ "$response" != "200" ]; then
  echo -e "${RED}Server is not running. Please start the server with:${NC}"
  echo -e "${BLUE}npm run dev${NC}"
  exit 1
fi

echo -e "${GREEN}Server is running! Starting tests...${NC}"

# Test the health endpoint
echo -e "${BLUE}Testing health endpoint...${NC}"
curl -s http://localhost:3000/health | jq

# Test the projects endpoint with auth token
echo -e "${BLUE}Testing projects endpoint...${NC}"
curl -s -H "Authorization: Bearer $GODEPLOY_ACCESS_TOKEN" http://localhost:3000/api/projects | jq

# Create a test SPA archive
echo -e "${BLUE}Creating test SPA archive...${NC}"
mkdir -p test-spa
echo "<html><body><h1>Hello GoDeploy!</h1></body></html>" > test-spa/index.html
zip -r test-spa.zip test-spa

# Test the deploy endpoint with auth token
echo -e "${BLUE}Testing deploy endpoint...${NC}"
curl -s -X POST \
  -H "Authorization: Bearer $GODEPLOY_ACCESS_TOKEN" \
  -F "archive=@test-spa.zip" \
  "http://localhost:3000/api/deploy?project=test-app" | jq

# Clean up
echo -e "${BLUE}Cleaning up test files...${NC}"
rm -rf test-spa test-spa.zip 

echo -e "${GREEN}All tests completed!${NC}" 