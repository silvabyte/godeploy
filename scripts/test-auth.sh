#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Check if the server is running
echo "🔍 Checking if the server is running..."
HEALTH_RESPONSE=$(curl -s "http://localhost:3000/health")
if [[ $HEALTH_RESPONSE != *"\"status\":\"ok\""* ]]; then
  echo "❌ Server is not running. Please start the server first."
  exit 1
fi
echo "✅ Server is running."

# Test the auth init endpoint
echo "🔑 Testing auth init endpoint..."
AUTH_INIT_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "redirect_uri":"http://localhost:38389/callback"}' \
  "http://localhost:3000/api/auth/init")

echo "📬 Auth init response:"
echo "$AUTH_INIT_RESPONSE" | jq .

echo "ℹ️ In a real scenario, Supabase would send a magic link to the user's email."
echo "ℹ️ The user would click the link, which would redirect to the CLI's callback URL with an access token."
echo "ℹ️ The CLI would capture the token and store it for future API calls."

# Test the verify endpoint with an existing token
if [ -n "$GODEPLOY_ACCESS_TOKEN" ]; then
  echo "🔐 Testing verify endpoint with existing token..."
  VERIFY_RESPONSE=$(curl -s -X GET \
    -H "Authorization: Bearer $GODEPLOY_ACCESS_TOKEN" \
    "http://localhost:3000/api/auth/verify")

  echo "🔍 Verify response:"
  echo "$VERIFY_RESPONSE" | jq .
else
  echo "⚠️ No GODEPLOY_ACCESS_TOKEN found in environment. Skipping verify test."
fi

echo "✅ Test completed." 