# Club Management System - PM2 Process Management

This document explains how to use PM2 to manage all microservices in the Club Management System from a single terminal.

## Quick Start

### 1. Initial Setup
```bash
# Install dependencies for all services
npm run setup

# Or step by step:
npm install                    # Install root dependencies (includes PM2)
npm run install:services      # Install all microservice dependencies
npm run install:frontend      # Install frontend dependencies
mkdir logs                     # Create logs directory
```

### 2. Start All Services
```bash
# Development mode
npm run dev
# or
./pm2.sh start
# or (Windows)
pm2.bat start

# Production mode
npm start
# or
./pm2.sh start:prod
```

### 3. Monitor Services
```bash
# Check status
npm run dev:status

# View logs (all services)
npm run dev:logs

# Monitor dashboard
npm run dev:monit

# Health check
npm run health
```

## Available Commands

### NPM Scripts
```bash
# Development
npm run dev              # Start all services
npm run dev:logs         # View logs
npm run dev:status       # Check status
npm run dev:stop         # Stop all services
npm run dev:restart      # Restart all services
npm run dev:reload       # Zero-downtime reload
npm run dev:delete       # Remove from PM2
npm run dev:monit        # Monitoring dashboard

# Production
npm start                # Start in production mode
npm run stop             # Stop all services
npm run restart          # Restart all services
npm run logs             # View logs
npm run status           # Check status
npm run monit            # Monitoring dashboard

# Management
npm run setup            # Complete setup
npm run health           # Health check
npm run reset            # Reset PM2 completely
```

### Direct Script Usage

#### Linux/macOS
```bash
./pm2.sh setup           # Setup environment
./pm2.sh start           # Start development
./pm2.sh start:prod      # Start production
./pm2.sh stop            # Stop all
./pm2.sh restart         # Restart all
./pm2.sh reload          # Zero-downtime reload
./pm2.sh logs            # View logs
./pm2.sh status          # Check status
./pm2.sh monitor         # Monitoring dashboard
./pm2.sh health          # Health check
./pm2.sh delete          # Delete all processes
./pm2.sh reset           # Reset PM2
```

#### Windows
```cmd
pm2.bat setup           # Setup environment
pm2.bat start            # Start development
pm2.bat start:prod       # Start production
pm2.bat stop             # Stop all
pm2.bat restart          # Restart all
pm2.bat reload           # Zero-downtime reload
pm2.bat logs             # View logs
pm2.bat status           # Check status
pm2.bat monitor          # Monitoring dashboard
pm2.bat health           # Health check
pm2.bat delete           # Delete all processes
pm2.bat reset            # Reset PM2
```

## Service Configuration

### Managed Services
The PM2 configuration manages the following services:

1. **auth-service** - Port 3001
2. **club-service** - Port 3002
3. **event-service** - Port 3003
4. **finance-service** - Port 3004
5. **notify-service** - Port 3005
6. **user-service** - Port 3006
7. **frontend** - Port 3000 (Next.js)

### Service Features
- **Auto-restart**: Services automatically restart on crash
- **Log management**: Centralized logging in `/logs` directory
- **Watch mode**: Backend services watch for file changes in development
- **Health monitoring**: Built-in health checks and monitoring
- **Zero-downtime reload**: Production deployments without downtime

## Monitoring and Debugging

### View Individual Service Logs
```bash
# View specific service logs
pm2 logs auth-service
pm2 logs club-service
pm2 logs frontend

# Real-time log streaming
pm2 logs --lines 50
```

### Service Management
```bash
# Start/stop individual services
pm2 start auth-service
pm2 stop auth-service
pm2 restart auth-service

# View detailed info
pm2 describe auth-service
pm2 monit
```

### Troubleshooting
```bash
# Check if PM2 is running
pm2 ping

# View PM2 processes
pm2 list

# Clear logs
pm2 flush

# Restart PM2 daemon
pm2 kill
pm2 resurrect
```

## Log Files

All service logs are stored in the `/logs` directory:
- `auth-service.log` - Combined logs
- `auth-service-error.log` - Error logs only
- `auth-service-out.log` - Standard output logs
- ... (similar for each service)

## Environment Variables

### Development Environment
Each service runs with:
- `NODE_ENV=development`
- Service-specific `PORT` configuration
- `HOST=0.0.0.0`
- File watching enabled

### Production Environment
- `NODE_ENV=production`
- Optimized for performance
- No file watching
- Enhanced error handling

## Best Practices

1. **Always run setup first**: `npm run setup`
2. **Use npm scripts**: They provide error handling and consistency
3. **Monitor regularly**: Use `npm run dev:monit` to watch service health
4. **Check logs**: Use `npm run dev:logs` to debug issues
5. **Graceful shutdown**: Use `npm run dev:stop` instead of killing processes

## Production Deployment

For production deployment:
```bash
# Setup production environment
npm run setup

# Start in production mode
npm start

# Monitor
npm run monit

# View logs
npm run logs
```

## Common Issues

### PM2 Not Found
```bash
npm install -g pm2
# or
npm install  # (includes PM2 as devDependency)
```

### Port Conflicts
Check if ports 3000-3006 are available:
```bash
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000
```

### Service Won't Start
1. Check logs: `npm run dev:logs`
2. Verify dependencies: `npm run install:services`
3. Check configuration: `pm2 describe service-name`

## Advanced Usage

### Custom PM2 Commands
```bash
# Scale services (for load testing)
pm2 scale auth-service 3

# Set memory limit
pm2 start ecosystem.config.js --max-memory-restart 500M

# Save PM2 configuration
pm2 save
pm2 startup
```

This setup provides a robust, production-ready process management solution for your microservices architecture using PM2.
