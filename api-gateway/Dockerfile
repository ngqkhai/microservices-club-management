# Use the official Kong open-source image as the base
FROM kong:latest

# Temporarily switch to the root user to install packages
USER root

# Install curl and development tools
RUN apt-get update && apt-get install -y curl git build-essential && rm -rf /var/lib/apt/lists/*

# Create custom plugin directories
RUN mkdir -p /usr/local/share/lua/5.1/kong/plugins/jwt-claims-headers
RUN mkdir -p /usr/local/share/lua/5.1/kong/plugins/api-gateway-secret

# Create a dedicated, isolated directory for your plugins
RUN mkdir -p /opt/kong/custom-plugins

# Copy your entire lua-plugins directory into it
COPY ./lua-plugins/ /opt/kong/custom-plugins/

# Set ownership for the kong user
RUN chown -R kong:kong /opt/kong/custom-plugins

# Copy the declarative configuration file into the image
COPY kong.yml /etc/kong/kong.yml

# Revert to the non-privileged kong user for security
USER kong
