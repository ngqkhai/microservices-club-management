#!/bin/sh
set -e

echo "Starting Kong with environment variable substitution..."

# Set default API Gateway secret if not provided
export API_GATEWAY_SECRET=${API_GATEWAY_SECRET:-"c44d002c75b696ba2200d49c6fadb8f3"}

# Substitute environment variables in the kong config
envsubst < /etc/kong/kong.yml > /tmp/kong-processed.yml

# Set Kong to use the processed config
export KONG_DECLARATIVE_CONFIG=/tmp/kong-processed.yml

# Debug: Show the processed config only if explicitly enabled
if [ "${KONG_DEBUG_CONFIG:-false}" = "true" ]; then
  echo "--- START OF PROCESSED KONG CONFIG ---"
  cat /tmp/kong-processed.yml
  echo "--- END OF PROCESSED KONG CONFIG ---"
fi

echo "Kong configuration processed and loaded."

# Execute the original Kong entrypoint command to start the gateway
exec /docker-entrypoint.sh kong docker-start