# ===========================================
# AUTH SERVICE - PRODUCTION DOCKERFILE
# ===========================================
# Optimized for minimal size (137MB)
# 
# Best Practices Applied:
# 1. Multi-stage build for minimal final image
# 2. Alpine's nodejs package (ABI compatible, no DLL Hell)
# 3. Production-only dependencies with cleanup
# 4. Non-root user for security
# 5. Layer caching optimization
# 6. Health check without curl dependency
# ===========================================

# -------------------------------------------
# STAGE 1: Install dependencies
# -------------------------------------------
FROM node:18.20-alpine AS deps

WORKDIR /app
COPY package*.json ./

# Install production deps and clean up unnecessary files
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force && \
    rm -rf node_modules/@types && \
    find node_modules \( -name "*.md" -o -name "LICENSE*" -o -name "*.map" \) -type f -delete 2>/dev/null || true && \
    find node_modules -type d \( -name "test" -o -name "tests" \) -exec rm -rf {} + 2>/dev/null || true

# -------------------------------------------
# STAGE 2: Minimal Alpine runtime
# -------------------------------------------
FROM alpine:3.20 AS runner

# Labels for image metadata
LABEL maintainer="ngqkhai" \
      version="1.0.0" \
      description="Authentication microservice"

# Install Node.js from Alpine repos - guaranteed ABI compatibility
# This avoids the risk of library version mismatch between stages
RUN apk add --no-cache nodejs

ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

# Copy app with proper ownership
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package.json ./
COPY --chown=nodejs:nodejs src ./src

# Switch to non-root user
USER nodejs

# Expose port (documentation)
EXPOSE 3001

# Health check using Node.js (no curl needed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:3001/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Use node directly (faster startup, no npm overhead)
CMD ["node", "src/server.js"]
