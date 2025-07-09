# Multi-stage Dockerfile for User Service
FROM node:18-alpine AS base

# Install curl for healthchecks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
# Install all dependencies including dev dependencies
RUN npm ci
# Copy source code
COPY . .
# Expose port
EXPOSE 3004
# Start with nodemon for development
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force
# Copy source code
COPY . .
# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
# Change ownership
RUN chown -R nodejs:nodejs /app
# Switch to non-root user
USER nodejs
# Expose port
EXPOSE 3004
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3004/health || exit 1
# Start application
CMD ["npm", "start"] 