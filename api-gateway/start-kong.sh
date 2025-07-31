#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Define the list of variables to be substituted. This is safer than letting
# envsubst try to replace all shell variables.
export DOLLAR='$'
VARS_TO_SUBSTITUTE=$(printf '\$%s,' \
  AUTH_SERVICE_URL \
  CLUB_SERVICE_URL \
  EVENT_SERVICE_URL \
  NOTIFY_SERVICE_URL \
  API_GATEWAY_SECRET \
)

# First, substitute variables except JWT_RSA_PUBLIC_KEY
envsubst "$VARS_TO_SUBSTITUTE" < /etc/kong/kong.yml > /tmp/kong.yml.temp

# Now handle the RSA public key properly
# Replace ${JWT_RSA_PUBLIC_KEY} with the properly formatted YAML literal block
awk -v rsa_key="$JWT_RSA_PUBLIC_KEY" '
  {
    if ($0 ~ /rsa_public_key: \${JWT_RSA_PUBLIC_KEY}/) {
      print "        rsa_public_key: |"
      # Split the RSA key by newlines and indent each line
      n = split(rsa_key, lines, "\n")
      for (i = 1; i <= n; i++) {
        if (lines[i] != "") {
          print "          " lines[i]
        }
      }
    } else {
      print $0
    }
  }
' /tmp/kong.yml.temp > /tmp/kong.yml.substituted

# Replace the original config with the new one
mv /tmp/kong.yml.substituted /etc/kong/kong.yml

# Clean up temporary file
rm -f /tmp/kong.yml.temp

echo "Kong configuration has been processed."

# Execute the original Kong entrypoint command to start the gateway
exec /docker-entrypoint.sh kong docker-start