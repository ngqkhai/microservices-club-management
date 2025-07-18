# Developer Setup Guide - Club Management System

A complete guide for setting up the Club Management System on a fresh operating system installation.

## 📋 Table of Contents

1. [Prerequisites & System Requirements](#prerequisites--system-requirements)
2. [Environment Setup](#environment-setup)
3. [Source Code Setup](#source-code-setup)
4. [Configuration Settings](#configuration-settings)
5. [Database Setup](#database-setup)
6. [Build & Compilation](#build--compilation)
7. [Running the System](#running-the-system)
8. [Development Workflow](#development-workflow)
9. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites & System Requirements

### Operating System Support
- **Windows 10/11** (PowerShell 5.1+)
- **macOS 10.15+** (Catalina or later)
- **Linux** (Ubuntu 18.04+, CentOS 7+, or equivalent)

### Required Software Installation

#### 1. Node.js & NPM
```bash
# Download and install Node.js 18+ from https://nodejs.org
# Verify installation
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 8.0.0 or higher
```

**Windows:**
```powershell
# Using Chocolatey (optional)
choco install nodejs

# Or download installer from nodejs.org
```

**macOS:**
```bash
# Using Homebrew
brew install node@18

# Or download installer from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 2. Git
```bash
# Verify installation
git --version
```

**Windows:**
```powershell
# Download from https://git-scm.com/downloads
# Or using Chocolatey
choco install git
```

**macOS:**
```bash
# Usually pre-installed, or install via Xcode Command Line Tools
xcode-select --install

# Or using Homebrew
brew install git
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git
```

#### 3. Database Systems

**PostgreSQL (Required for most services)**
```bash
# Download from https://www.postgresql.org/download/
```

**Windows:**
```powershell
# Download installer from postgresql.org
# Or using Chocolatey
choco install postgresql
```

**macOS:**
```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**MongoDB (Required for some services)**
```bash
# Download from https://www.mongodb.com/try/download/community
```

**Windows:**
```powershell
# Download installer from mongodb.com
# Or using Chocolatey
choco install mongodb
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb/brew/mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 4. Redis (Optional, for caching)
**Windows:**
```powershell
# Download from https://github.com/tporadowski/redis/releases
# Or using WSL2 with Linux Redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

## 🛠 Environment Setup

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/quockhanh41/club-management-system.git
cd club-management-system

# Switch to development branch (if needed)
git checkout khai-ngan
```

### 2. Install Global Dependencies
```bash
# Install PM2 globally for process management
npm install -g pm2

# Install other useful global tools
npm install -g nodemon
npm install -g concurrently

# Verify PM2 installation
pm2 --version
```

### 3. Project Dependencies Setup
```bash
# Install all project dependencies (root + services + frontend)
npm run setup

# This command runs:
# - npm install (root dependencies)
# - npm run install:services (all microservices)
# - npm run install:frontend (frontend dependencies)
# - Creates logs directory
```

**Manual Installation (if npm run setup fails):**
```bash
# Root dependencies
npm install

# Individual service dependencies
cd services/auth && npm install && cd ../..
cd services/club && npm install && cd ../..
cd services/event && npm install && cd ../..
cd services/finance && npm install && cd ../..
cd services/notify && npm install && cd ../..
cd services/user && npm install && cd ../..

# Frontend dependencies
cd new-frontend && npm install && cd ..

# Create logs directory
mkdir logs
```

## ⚙️ Configuration Settings

### 1. Environment Variables Setup

#### Development Environment
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your local settings
```

**Required Environment Variables:**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=club_management_dev
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/club_management_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development-only
JWT_EXPIRES_IN=24h

# Service Ports (default configuration)
AUTH_SERVICE_PORT=3001
CLUB_SERVICE_PORT=3002
EVENT_SERVICE_PORT=3003
FINANCE_SERVICE_PORT=3004
NOTIFY_SERVICE_PORT=3005
USER_SERVICE_PORT=3006
FRONTEND_PORT=3000
```

#### Service-Specific Configuration
Each service may have its own `.env` file:

```bash
# Auth Service
cd services/auth
cp .env.example .env
# Edit with auth-specific settings

# Club Service  
cd services/club
cp .env.example .env
# Edit with club-specific settings

# Repeat for other services as needed
```

### 2. Database Configuration

#### PostgreSQL Setup
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE club_management_dev;
CREATE USER club_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE club_management_dev TO club_user;
\q
```

#### MongoDB Setup
```bash
# Connect to MongoDB
mongosh

# Create database (MongoDB creates it automatically when you insert data)
use club_management_dev

# Create a test collection to verify connection
db.test.insertOne({message: "Hello World"})
db.test.find()
```

### 3. API Gateway Configuration (Kong)
```bash
# If using Kong API Gateway
cd api-gateway

# Review kong.yml configuration
# Start Kong (if using Docker)
docker-compose up -d kong
```

## 🗄️ Database Setup

### 1. Run Database Migrations
```bash
# Auth Service (PostgreSQL)
cd services/auth
npm run migrate

# If migration command doesn't exist, run manually:
npx sequelize-cli db:migrate
cd ../..

# Other services with migrations
cd services/club
npm run migrate  # or setup commands specific to the service
cd ../..
```

### 2. Seed Initial Data (Optional)
```bash
# Auth Service
cd services/auth
npm run seed
# or
npx sequelize-cli db:seed:all
cd ../..

# Run seed scripts for other services as needed
```

### 3. Database Setup Scripts
```bash
# Run provided setup scripts (if available)
cd database_script

# PostgreSQL setup
psql -U postgres -d club_management_dev -f setup-postgresql.sql

# MongoDB setup  
mongosh club_management_dev setup-mongodb.js
cd ..
```

## 🏗️ Build & Compilation

### 1. Backend Services Compilation
Most Node.js services don't require compilation, but some may have build steps:

```bash
# Check if services have build scripts
cd services/auth
npm run build  # If build script exists
cd ../..

# Repeat for services that have build steps
```

### 2. Frontend Build
```bash
# Development build (with hot reload)
cd new-frontend
npm run dev  # This starts the development server

# Production build
npm run build  # Creates optimized production build
npm start      # Serves the production build
cd ..
```

### 3. Verify Builds
```bash
# Check if all services have necessary files
ls -la services/*/src/
ls -la new-frontend/

# Verify package.json scripts
cat services/auth/package.json | grep -A 10 '"scripts"'
```

## 🚀 Running the System

### 1. Start All Services with PM2 (Recommended)
```bash
# Start all services in development mode
npm run dev

# Verify all services are running
npm run dev:status

# View logs
npm run dev:logs

# Open monitoring dashboard
npm run dev:monit
```

### 2. Manual Service Startup (Alternative)
```bash
# Terminal 1: Auth Service
cd services/auth
npm run dev

# Terminal 2: Club Service  
cd services/club
npm run dev

# Terminal 3: Event Service
cd services/event
npm run dev

# Continue for other services...

# Terminal 7: Frontend
cd new-frontend
npm run dev
```

### 3. Production Startup
```bash
# Build frontend for production
cd new-frontend
npm run build
cd ..

# Start all services in production mode
npm start

# Monitor services
npm run monit
```

### 4. Docker-based Startup (Alternative)
```bash
# If Docker Compose is configured
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔄 Development Workflow

### 1. Daily Development Commands
```bash
# Start development environment
npm run dev

# Check service health
npm run health:check

# View logs for debugging
npm run dev:logs

# Restart services after major changes
npm run dev:restart

# Stop all services at end of day
npm run dev:stop
```

### 2. Making Code Changes

#### Backend Services
1. Make changes to service code in `services/[service-name]/src/`
2. Services will auto-restart (PM2 watch mode enabled)
3. Check logs: `npm run dev:logs`
4. Test endpoints using API client (Postman, curl, etc.)

#### Frontend Changes
1. Make changes to frontend code in `new-frontend/`
2. Next.js has built-in hot reload
3. View changes in browser at `http://localhost:3000`

### 3. Testing Changes
```bash
# Run tests (if available)
npm test

# Test individual services
cd services/auth
npm test
cd ../..

# Run integration tests
npm run test:integration
```

### 4. Database Changes
```bash
# Create new migration
cd services/auth
npx sequelize-cli migration:generate --name add-new-feature

# Edit migration file in migrations/ directory
# Run migration
npm run migrate
cd ../..
```

## 🌐 Accessing the System

Once all services are running, you can access:

- **Frontend Application**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Club Service**: http://localhost:3002
- **Event Service**: http://localhost:3003
- **Finance Service**: http://localhost:3004
- **Notify Service**: http://localhost:3005
- **User Service**: http://localhost:3006

### Health Check Endpoints
```bash
# Check if services are responding
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
# ... etc

# Or use the built-in health check
npm run health:check
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Port Already in Use
```bash
# Windows - Find and kill process using port
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# macOS/Linux - Find and kill process using port
lsof -i :3001
kill -9 <process_id>

# Or use different ports in .env file
```

#### 2. Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d club_management_dev

# Test MongoDB connection
mongosh mongodb://localhost:27017/club_management_dev

# Check if database services are running
# Windows
services.msc (look for PostgreSQL, MongoDB)

# macOS
brew services list

# Linux
sudo systemctl status postgresql
sudo systemctl status mongod
```

#### 3. Node.js/NPM Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### 4. PM2 Issues
```bash
# Reset PM2 completely
npm run reset

# Check PM2 status
pm2 status

# View PM2 logs
pm2 logs

# Restart PM2 daemon
pm2 kill
pm2 resurrect
```

#### 5. Frontend Build Issues
```bash
cd new-frontend

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start development server
npm run dev
cd ..
```

### Getting Help

#### Logs and Debugging
```bash
# View all service logs
npm run dev:logs

# View specific service logs
pm2 logs auth-service

# View with more detail
pm2 logs auth-service --lines 100

# Monitor in real-time
npm run dev:monit
```

#### Health Monitoring
```bash
# Comprehensive health check
npm run health:check

# Continuous monitoring
npm run health:watch

# Check PM2 process status
npm run dev:status
```

## 📝 Quick Reference Commands

### Essential Commands
```bash
# First-time setup
npm run setup

# Daily development
npm run dev           # Start all services
npm run dev:status    # Check status
npm run dev:logs      # View logs
npm run dev:stop      # Stop all services

# Health monitoring
npm run health:check  # One-time health check
npm run health:watch  # Continuous monitoring

# Maintenance
npm run dev:restart   # Restart all services
npm run reset         # Reset PM2 completely
```

This guide should help any developer set up and run the Club Management System on a fresh operating system installation. For specific issues not covered here, check the individual service README files or the PM2_GUIDE.md for detailed process management information.
