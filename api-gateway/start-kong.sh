#!/bin/sh

set -e

export DOLLAR='$'
VARS_TO_SUBSTITUTE=$(printf '$%s,' \
  AUTH_SERVICE_URL \
  CLUB_SERVICE_URL \
  EVENT_SERVICE_URL \
  NOTIFY_SERVICE_URL \
  API_GATEWAY_SECRET \
  JWT_RSA_PUBLIC_KEY \
)

# Substitute all variables directly into kong.yml
envsubst "$VARS_TO_SUBSTITUTE" < /etc/kong/kong.yml > /tmp/kong.yml.substituted

# ==========================================================
# ADD THESE THREE LINES TO DEBUG THE GENERATED CONFIG
echo "--- START OF GENERATED KONG CONFIG ---"
cat /tmp/kong.yml.substituted
echo "--- END OF GENERATED KONG CONFIG ---"
# ==========================================================

# Replace the original config with the new one
mv /tmp/kong.yml.substituted /etc/kong/kong.yml

# Clean up temporary file
rm -f /tmp/kong.yml.temp

echo "Kong configuration has been processed."

# Execute the original Kong entrypoint command to start the gateway
exec /docker-entrypoint.sh kong docker-start