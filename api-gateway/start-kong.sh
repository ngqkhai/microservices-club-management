#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

#Validate that the PORT environment variable is set.
echo "INFO: Validating configuration..."
kong check /etc/kong/kong.yml
echo "INFO: Configuration is valid."

# Echo the port for debugging in the Render logs.
echo "INFO: Launching Kong, listening on 0.0.0.0:${PORT}"

# Tell Kong to listen on the port Render provides.
export KONG_PROXY_LISTEN="0.0.0.0:${PORT}"

# Execute the main Kong start process.
# 'exec' replaces the shell process with the Kong process,
# which is the correct way to run services in containers.
exec /usr/local/bin/kong start