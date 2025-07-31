# Use the official Kong open-source image as the base
FROM kong:latest

# Switch to the root user to create directories and copy files
USER root

# Create a directory for our custom plugins that mirrors the expected Lua namespace structure
# e.g., /opt/kong/custom-plugins/kong/plugins/api-gateway-secret/
RUN mkdir -p /opt/kong/custom-plugins/kong/plugins

# Copy the plugin implementation directories into the structure created above
COPY ./lua-plugins/api-gateway-secret /opt/kong/custom-plugins/kong/plugins/api-gateway-secret
COPY ./lua-plugins/jwt-claims-headers /opt/kong/custom-plugins/kong/plugins/jwt-claims-headers

# Set ownership for the kong user
RUN chown -R kong:kong /opt/kong/custom-plugins

# Set the environment variable for the declarative config
ENV KONG_DECLARATIVE_CONFIG=/etc/kong/kong.yml

# Add our custom plugin directory to Kong's Lua path.
# Kong will search this path for custom plugins. The ';;' appends the default path.
ENV KONG_LUA_PACKAGE_PATH=/opt/kong/custom-plugins/?.lua;;

# Revert to the non-privileged kong user for security
USER kong