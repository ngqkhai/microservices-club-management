# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3005

# Start development server
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Copy source code
COPY . .

# Create logs directory with proper permissions
RUN mkdir -p logs && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start production server
CMD ["npm", "start"] 