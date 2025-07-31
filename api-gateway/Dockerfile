# Use the official Kong open-source image as the base
FROM kong:latest

# Switch to the root user to create directories and copy files
USER root

# Create a directory for our custom plugins that mirrors the expected Lua namespace structure
RUN mkdir -p /opt/kong/custom-plugins/kong/plugins

# Copy the plugin implementation directories into the structure created above
COPY ./lua-plugins/api-gateway-secret /opt/kong/custom-plugins/kong/plugins/api-gateway-secret
COPY ./lua-plugins/jwt-claims-headers /opt/kong/custom-plugins/kong/plugins/jwt-claims-headers

# Create the directory for the declarative configuration
RUN mkdir -p /usr/local/kong/declarative

# Copy the declarative configuration file into the image
COPY kong.yml /usr/local/kong/declarative/kong.yml

# Set ownership for all our custom files and directories to the kong user
RUN chown -R kong:kong /opt/kong/custom-plugins /usr/local/kong/declarative

# Add our custom plugin directory to Kong's Lua path.
# This is now handled in the Dockerfile, but setting it in Railway won't hurt.
ENV KONG_LUA_PACKAGE_PATH="/opt/kong/custom-plugins/?.lua;;"

# Revert to the non-privileged kong user for security
USER kong
