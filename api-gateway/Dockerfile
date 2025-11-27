# ===========================================
# API GATEWAY - KONG 3.0 (Alpine-based)
# ===========================================
# Optimized: 254MB vs 530MB (52% smaller)
# ===========================================

FROM kong:3.0

USER root

# Install envsubst (Alpine uses apk, not apt-get)
RUN apk add --no-cache gettext

# Create and copy custom plugins
RUN mkdir -p /usr/local/share/lua/5.1/kong/plugins/jwt-claims-headers && \
    mkdir -p /usr/local/share/lua/5.1/kong/plugins/api-gateway-secret

COPY lua-plugins/jwt-claims-headers /usr/local/share/lua/5.1/kong/plugins/jwt-claims-headers/
COPY lua-plugins/api-gateway-secret /usr/local/share/lua/5.1/kong/plugins/api-gateway-secret/

# Copy configuration and startup script
COPY kong.yml /etc/kong/kong.yml
COPY start-kong.sh /usr/local/bin/start-kong.sh
RUN chmod +x /usr/local/bin/start-kong.sh

USER kong

CMD ["start-kong.sh"]