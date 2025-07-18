# Frontend Docker Deployment Guide

This guide explains how to deploy the Next.js frontend application using Docker.

## Files Created

### 1. `newfrontend/Dockerfile`
- Multi-stage Docker build optimized for Next.js
- Uses Node.js 18 Alpine for smaller image size
- Leverages Next.js standalone output for production deployment
- Includes proper user permissions and security practices

### 2. `newfrontend/.dockerignore`
- Excludes unnecessary files from Docker build context
- Reduces build time and image size

### 3. `newfrontend/app/api/health/route.ts`
- Health check endpoint at `/api/health`
- Used by Docker Compose health checks

### 4. Updated `next.config.mjs`
- Added `output: 'standalone'` for Docker optimization
- Enables efficient production deployments

### 5. Updated `docker-compose.yml`
- Added frontend service configuration
- Includes health checks and proper networking

## Deployment Options

### Option 1: Using Docker Compose (Recommended)

Run the entire stack including the frontend:

```bash
docker-compose up -d
```

The frontend will be available at: http://localhost:3000

### Option 2: Standalone Docker Container

Build and run just the frontend:

```bash
# Build the image
docker build -t club-management-frontend ./newfrontend

# Run the container
docker run -d \
  --name club-management-frontend \
  -p 3000:3000 \
  --env-file .env \
  club-management-frontend
```

### Option 3: Using the Provided Scripts

**Windows:**
```cmd
.\run-frontend.bat
```

**Linux/macOS:**
```bash
chmod +x run-frontend.sh
./run-frontend.sh
```

## Environment Variables

The following environment variables are configured in `.env`:

```env
# Frontend Environment Variables
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
API_GATEWAY_SECRET=club-mgmt-internal-secret-2024
```

## Health Check

The frontend includes a health check endpoint:
- URL: http://localhost:3000/api/health
- Returns JSON with status, timestamp, and service information

## Container Details

- **Base Image:** Node.js 18 Alpine
- **Port:** 3000
- **User:** nextjs (non-root)
- **Build Tool:** pnpm
- **Production Mode:** Standalone Next.js output

## Troubleshooting

### Check Container Status
```bash
docker ps
```

### View Container Logs
```bash
docker logs club-management-frontend
```

### Check Health
```bash
curl http://localhost:3000/api/health
```

### Rebuild After Changes
```bash
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

## Production Considerations

1. **SSL/TLS:** Configure reverse proxy (nginx/traefik) for HTTPS
2. **Environment Variables:** Use Docker secrets or external config management
3. **Resource Limits:** Set memory and CPU limits in docker-compose.yml
4. **Monitoring:** Add logging and monitoring solutions
5. **CDN:** Serve static assets through CDN for better performance

## Next Steps

1. The frontend is now containerized and ready for deployment
2. Configure your API gateway URL in environment variables
3. Set up SSL certificates for production
4. Consider adding monitoring and logging solutions
