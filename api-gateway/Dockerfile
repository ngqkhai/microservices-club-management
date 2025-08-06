# Use the official Kong open-source image as the base
FROM kong:latest

# Switch to the root user to create directories and copy files
USER root

# Install envsubst (part of gettext package)
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

# Create and copy custom plugins
RUN mkdir -p /usr/local/share/lua/5.1/kong/plugins/jwt-claims-headers
RUN mkdir -p /usr/local/share/lua/5.1/kong/plugins/api-gateway-secret
COPY lua-plugins/jwt-claims-headers /usr/local/share/lua/5.1/kong/plugins/jwt-claims-headers/
COPY lua-plugins/api-gateway-secret /usr/local/share/lua/5.1/kong/plugins/api-gateway-secret/

# Copy the declarative configuration files into the image
COPY kong.yml /etc/kong/kong.yml

# Copy the startup script and make it executable
COPY start-kong.sh /usr/local/bin/start-kong.sh
RUN chmod +x /usr/local/bin/start-kong.sh

# Revert to the non-privileged kong user for security
USER kong

# Set the custom startup script as the command to run
CMD ["start-kong.sh"]