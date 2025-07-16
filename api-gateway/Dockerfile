# Use the official Kong open-source image as the base
FROM kong:latest

# Temporarily switch to the root user to install packages
USER root

# Install curl and development tools
RUN apt-get update && apt-get install -y curl git build-essential && rm -rf /var/lib/apt/lists/*

# Create custom plugin directories
RUN mkdir -p /usr/local/share/lua/5.1/kong/plugins/jwt-claims-headers
RUN mkdir -p /usr/local/share/lua/5.1/kong/plugins/api-gateway-secret

# Copy the custom plugins
COPY lua-plugins/jwt-claims-headers /usr/local/share/lua/5.1/kong/plugins/jwt-claims-headers/
COPY lua-plugins/api-gateway-secret /usr/local/share/lua/5.1/kong/plugins/api-gateway-secret/

# Revert to the non-privileged kong user for security
USER kong
