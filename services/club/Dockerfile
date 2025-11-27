# ===========================================
# CLUB SERVICE - PRODUCTION DOCKERFILE
# ===========================================
# Optimized for minimal size using Alpine's nodejs
# ===========================================

# -------------------------------------------
# STAGE 1: Install dependencies
# -------------------------------------------
FROM node:18-alpine AS deps

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
FROM alpine:3.20 AS production

LABEL maintainer="Club Management Team" \
      version="1.0.0" \
      description="Club microservice"

# Install Node.js from Alpine repos - guaranteed ABI compatibility
RUN apk add --no-cache nodejs

ENV NODE_ENV=production \
    PORT=3002

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

# Copy app with proper ownership
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs package.json ./
COPY --chown=nodejs:nodejs src ./src

USER nodejs
EXPOSE 3002

# Health check using Node.js (no curl needed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://127.0.0.1:3002/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]
