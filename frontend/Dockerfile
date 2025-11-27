# ===========================================
# FRONTEND - PRODUCTION DOCKERFILE
# ===========================================
# Optimized Next.js build with minimal Alpine runtime
# ===========================================

# -------------------------------------------
# STAGE 1: Dependencies
# -------------------------------------------
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund && \
    npm cache clean --force

# -------------------------------------------
# STAGE 2: Builder
# -------------------------------------------
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Next.js public env vars
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_TIMEOUT
ARG NEXT_PUBLIC_ENV
ARG NEXT_PUBLIC_JWT_STORAGE_KEY
ARG NEXT_PUBLIC_JWT_REFRESH_STORAGE_KEY
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_DEBUG

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_API_TIMEOUT=$NEXT_PUBLIC_API_TIMEOUT \
    NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV \
    NEXT_PUBLIC_JWT_STORAGE_KEY=$NEXT_PUBLIC_JWT_STORAGE_KEY \
    NEXT_PUBLIC_JWT_REFRESH_STORAGE_KEY=$NEXT_PUBLIC_JWT_REFRESH_STORAGE_KEY \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION \
    NEXT_PUBLIC_DEBUG=$NEXT_PUBLIC_DEBUG

RUN npm run build

# -------------------------------------------
# STAGE 3: Minimal Alpine runner
# -------------------------------------------
FROM alpine:3.20 AS runner

# Install Node.js from Alpine repos (ABI safe, smaller than node:18-alpine)
RUN apk add --no-cache nodejs

WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p .next && \
    chown nextjs:nodejs .next

# Copy static assets and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
