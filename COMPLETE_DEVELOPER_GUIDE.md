# Complete Developer Setup Guide - Club Management System

A comprehensive guide for setting up, configuring, and running the Club Management System on a fresh operating system installation.

---

## 📋 Table of Contents

1. [System Requirements & Prerequisites](#system-requirements--prerequisites)
2. [Operating System Setup](#operating-system-setup)
3. [Development Tools Installation](#development-tools-installation)
4. [Database Systems Setup](#database-systems-setup)
5. [Source Code Setup](#source-code-setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Configuration & Setup](#database-configuration--setup)
8. [Dependencies Installation](#dependencies-installation)
9. [Build & Compilation](#build--compilation)
10. [Process Management Setup (PM2)](#process-management-setup-pm2)
11. [Running the System](#running-the-system)
12. [Development Workflow](#development-workflow)
13. [Script Execution & Management](#script-execution--management)
14. [Monitoring & Health Checks](#monitoring--health-checks)
15. [Production Deployment](#production-deployment)
16. [Troubleshooting](#troubleshooting)
17. [Quick Reference](#quick-reference)

---

## 🔧 System Requirements & Prerequisites

### Minimum Hardware Requirements
- **CPU**: 2+ cores, 2.4 GHz or higher
- **RAM**: 8 GB minimum, 16 GB recommended
- **Storage**: 10 GB free space minimum
- **Network**: Internet connection for downloading dependencies

### Operating System Support
- **Windows 10/11** (PowerShell 5.1+)
- **macOS 10.15+** (Catalina or later)
- **Linux** (Ubuntu 18.04+, CentOS 7+, Debian 10+, or equivalent)

---

## 💻 Operating System Setup

### Windows Setup
```powershell
# Enable PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install Windows Package Manager (if not installed)
# Download from Microsoft Store or GitHub releases
```

### macOS Setup
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (package manager)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Update Homebrew
brew update
```

### Linux Setup (Ubuntu/Debian)
```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential build tools
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
```

### Linux Setup (CentOS/RHEL)
```bash
# Update system
sudo yum update -y

# Install essential tools
sudo yum groupinstall -y "Development Tools"
sudo yum install -y curl wget
```

---

## 🛠 Development Tools Installation

### 1. Node.js & NPM Installation

#### Windows
```powershell
# Method 1: Download installer from https://nodejs.org
# Download Node.js 18.x LTS from official website

# Method 2: Using Chocolatey
# First install Chocolatey from https://chocolatey.org/install
choco install nodejs --version=18.17.0

# Method 3: Using winget (Windows 11)
winget install OpenJS.NodeJS

# Verify installation
node --version    # Should output v18.x.x
npm --version     # Should output 9.x.x or higher
```

#### macOS
```bash
# Method 1: Download installer from https://nodejs.org
# Download and install Node.js 18.x LTS

# Method 2: Using Homebrew (recommended)
brew install node@18
brew link node@18

# Method 3: Using MacPorts
sudo port install nodejs18

# Verify installation
node --version    # Should output v18.x.x
npm --version     # Should output 9.x.x or higher
```

#### Linux (Ubuntu/Debian)
```bash
# Method 1: Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Method 2: Using snap
sudo snap install node --classic

# Method 3: Using package manager (may have older version)
sudo apt install nodejs npm

# Verify installation
node --version    # Should output v18.x.x
npm --version     # Should output 9.x.x or higher
```

#### Linux (CentOS/RHEL)
```bash
# Using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Git Installation

#### Windows
```powershell
# Method 1: Download from https://git-scm.com/downloads
# Download and install Git for Windows

# Method 2: Using Chocolatey
choco install git

# Method 3: Using winget
winget install Git.Git

# Verify installation
git --version
```

#### macOS
```bash
# Usually pre-installed, verify first
git --version

# If not installed, install via Xcode Command Line Tools
xcode-select --install

# Or using Homebrew
brew install git

# Configure Git (first time setup)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install git

# CentOS/RHEL
sudo yum install git

# Verify installation
git --version

# Configure Git (first time setup)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Code Editor (Recommended)
```bash
# Visual Studio Code (recommended)
# Download from https://code.visualstudio.com/

# Extensions for this project:
# - JavaScript/TypeScript support
# - Node.js Extension Pack
# - PostgreSQL extension
# - MongoDB for VS Code
# - Docker extension
```

---

## 🗄️ Database Systems Setup

### PostgreSQL Installation & Setup

#### Windows
```powershell
# Method 1: Download installer from https://www.postgresql.org/download/windows/
# Download PostgreSQL 14.x installer

# Method 2: Using Chocolatey
choco install postgresql --params '/Password:postgres'

# Start PostgreSQL service
Start-Service postgresql-x64-14

# Verify installation
psql --version
```

#### macOS
```bash
# Using Homebrew (recommended)
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create a database superuser (if needed)
createuser -s postgres

# Verify installation
psql --version
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -i -u postgres
psql
\password postgres  # Set password for postgres user
\q
exit

# Verify installation
psql --version
```

#### PostgreSQL Configuration
```bash
# Connect to PostgreSQL as postgres user
psql -U postgres

# Create development database
CREATE DATABASE club_management_dev;

# Create database user
CREATE USER club_user WITH ENCRYPTED PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE club_management_dev TO club_user;
GRANT ALL ON SCHEMA public TO club_user;

# Exit PostgreSQL
\q
```

### MongoDB Installation & Setup

#### Windows
```powershell
# Method 1: Download from https://www.mongodb.com/try/download/community
# Download MongoDB Community Server

# Method 2: Using Chocolatey
choco install mongodb

# Start MongoDB service
Start-Service MongoDB

# Verify installation
mongosh --version
```

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0

# Start MongoDB service
brew services start mongodb/brew/mongodb-community

# Verify installation
mongosh --version
```

#### Linux
```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
mongosh --version
```

#### MongoDB Configuration
```bash
# Connect to MongoDB
mongosh

# Create development database
use club_management_dev

# Create a test collection to verify
db.test.insertOne({message: "Database setup complete"})

# View databases
show dbs

# Exit MongoDB
exit
```


## 📂 Source Code Setup

### 1. Clone Repository
```bash
# Clone the repository
git clone https://github.com/quockhanh41/club-management-system.git

# Navigate to project directory
cd club-management-system

# Check current branch
git branch

# Switch to development branch if needed
git checkout khai-ngan

# Pull latest changes
git pull origin khai-ngan
```

### 2. Explore Project Structure
```bash
# View project structure
ls -la

# Key directories:
# - services/          # Backend microservices
# - new-frontend/      # Frontend application
# - api-gateway/       # API Gateway configuration
# - database_script/   # Database setup scripts
# - logs/             # Application logs (created later)
```

### 3. Verify Project Files
```bash
# Check if key files exist
ls -la ecosystem.config.js    # PM2 configuration
ls -la package.json           # Root package configuration
ls -la .env.example          # Environment template
ls -la services/             # Microservices directory
ls -la new-frontend/         # Frontend directory
```

---

## ⚙️ Environment Configuration

### 1. Root Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your configuration
# Use your preferred text editor (nano, vim, code, etc.)
nano .env
```

### 2. Environment Variables Configuration
Edit the `.env` file with the following configuration:

```bash
# Application Environment
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=club_management_dev
DB_USER=club_user
DB_PASSWORD=your_secure_password

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/club_management_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development-only-min-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-for-development-min-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# Service Ports
AUTH_SERVICE_PORT=3001
CLUB_SERVICE_PORT=3002
EVENT_SERVICE_PORT=3003
FINANCE_SERVICE_PORT=3004
NOTIFY_SERVICE_PORT=3005
USER_SERVICE_PORT=3006
FRONTEND_PORT=3000

# API Gateway
API_GATEWAY_URL=http://localhost:8000
KONG_ADMIN_URL=http://localhost:8001

# External APIs
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined

# Security
BCRYPT_ROUNDS=10
SESSION_SECRET=your-session-secret-for-development

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_2FA=false

# Development Tools
ENABLE_SWAGGER=true
ENABLE_CORS=true
ENABLE_MORGAN_LOGGING=true
```

### 3. Service-Specific Environment Configuration
```bash
# Auth Service
cd services/auth
cp .env.example .env 2>/dev/null || echo "Creating .env file"
# Edit auth service specific variables
nano .env
cd ../..

# Club Service
cd services/club
cp .env.example .env 2>/dev/null || echo "Creating .env file"
nano .env
cd ../..

# Repeat for other services as needed
```

### 4. Frontend Environment Configuration
```bash
cd new-frontend

# Create environment file for Next.js
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CLUB_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_EVENT_SERVICE_URL=http://localhost:3003
EOF

cd ..
```

---

## 🗄️ Database Configuration & Setup

### 1. PostgreSQL Database Setup
```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d postgres

# If connection successful, create application database
psql -U postgres << EOF
CREATE DATABASE club_management_dev;
CREATE USER club_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE club_management_dev TO club_user;
GRANT ALL ON SCHEMA public TO club_user;
ALTER USER club_user CREATEDB;
\q
EOF

# Test connection with new user
psql -h localhost -U club_user -d club_management_dev -c "SELECT version();"
```

### 2. MongoDB Database Setup
```bash
# Connect to MongoDB and setup database
mongosh << EOF
use club_management_dev
db.test.insertOne({setup: "complete", timestamp: new Date()})
db.createUser({
  user: "club_user",
  pwd: "your_secure_password",
  roles: [
    { role: "readWrite", db: "club_management_dev" }
  ]
})
show dbs
exit
EOF
```

### 3. Run Database Setup Scripts
```bash
# Navigate to database scripts directory
cd database_script

# Run PostgreSQL setup script (if exists)
if [ -f "setup-postgresql.sql" ]; then
    psql -U club_user -d club_management_dev -f setup-postgresql.sql
    echo "PostgreSQL setup script executed"
fi

# Run MongoDB setup script (if exists)
if [ -f "setup-mongodb.js" ]; then
    mongosh club_management_dev setup-mongodb.js
    echo "MongoDB setup script executed"
fi

cd ..
```

---

## 📦 Dependencies Installation

### 1. Install Global Dependencies
```bash
# Install PM2 globally for process management
npm install -g pm2

# Install useful development tools
npm install -g nodemon
npm install -g concurrently

# Verify installations
pm2 --version
nodemon --version
```

### 2. Automated Dependency Installation
```bash
# Install all dependencies using the setup script
npm run setup

# This command will:
# 1. Install root dependencies (including PM2)
# 2. Install all microservice dependencies
# 3. Install frontend dependencies
# 4. Create logs directory
```

### 3. Manual Dependency Installation (if automated fails)
```bash
# Install root dependencies
npm install

# Install backend service dependencies
cd services/auth && npm install && cd ../..
cd services/club && npm install && cd ../..
cd services/event && npm install && cd ../..
cd services/finance && npm install && cd ../..
cd services/notify && npm install && cd ../..
cd services/user && npm install && cd ../..

# Install frontend dependencies
cd new-frontend && npm install && cd ..

# Create necessary directories
mkdir -p logs
mkdir -p uploads
```

### 4. Verify Dependencies Installation
```bash
# Check if node_modules exists in all services
ls -la services/*/node_modules | head -20

# Check if frontend dependencies are installed
ls -la new-frontend/node_modules | head -10

# Verify package.json scripts are available
npm run

# Check PM2 installation
which pm2
pm2 --version
```

---

## 🏗️ Build & Compilation

### 1. Backend Services Build
Most Node.js services don't require compilation, but check for build scripts:

```bash
# Check each service for build requirements
for service in auth club event finance notify user; do
    echo "Checking $service service..."
    cd services/$service
    
    # Check if build script exists
    if npm run | grep -q "build"; then
        echo "$service has build script, running build..."
        npm run build
    else
        echo "$service does not require build step"
    fi
    
    cd ../..
done
```

### 2. Frontend Build Configuration

#### Development Build Setup
```bash
cd newfrontend

# Check Next.js configuration
cat next.config.mjs

# Install frontend dependencies (if not done already)
npm install

# Run development build test
npm run build

# Clean build artifacts for development
rm -rf .next

cd ..
```

#### Production Build Preparation
```bash
cd newfrontend

# Create production build
npm run build

# Test production build locally
npm start &
sleep 5
curl http://localhost:3000
kill %1

cd ..
```

### 3. Verify All Builds
```bash
# Check if all services have required entry points
echo "Checking service entry points..."
ls -la services/auth/src/server.js
ls -la services/club/src/index.js
ls -la services/event/src/index.js
ls -la services/finance/src/index.js
ls -la services/notify/src/index.js
ls -la services/user/src/index.js

# Check frontend build output
ls -la new-frontend/.next 2>/dev/null || echo "Frontend not built yet"
```

---

## 🔄 Process Management Setup (PM2)

### 1. PM2 Configuration
The project includes a comprehensive PM2 configuration file (`ecosystem.config.js`):

```javascript
// ecosystem.config.js contents:
module.exports = {
  apps: [
    // Auth Service
    {
      name: 'auth-service',
      script: './services/auth/src/server.js',
      cwd: './services/auth',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      watch: ['./services/auth/src'],
      ignore_watch: ['node_modules', 'logs', '*.log'],
      log_file: './logs/auth-service.log',
      error_file: './logs/auth-service-error.log',
      out_file: './logs/auth-service-out.log',
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000
    },
    // ... (similar configuration for other services)
    
    // Frontend Application
    {
      name: 'frontend',
      script: 'npm',
      args: 'run dev',
      cwd: './new-frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // Next.js has its own hot reload
      log_file: './logs/frontend.log',
      max_restarts: 5,
      min_uptime: '10s',
      restart_delay: 4000
    }
  ]
};
```

### 2. PM2 Management Scripts

#### Cross-Platform Scripts Created
- `pm2.sh` - Linux/macOS management script
- `pm2.bat` - Windows management script

#### Make Scripts Executable (Linux/macOS)
```bash
chmod +x pm2.sh
```

### 3. Verify PM2 Configuration
```bash
# Test PM2 configuration syntax
pm2 ecosystem ecosystem.config.js

# Check PM2 status (should show no processes initially)
pm2 status

# Verify PM2 is working
pm2 ping
```

---

## 🚀 Running the System

### 1. Database Services Startup
Ensure databases are running before starting the application:

```bash
# PostgreSQL
# Windows: Check Services or run
net start postgresql-x64-14

# macOS
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
sudo systemctl status postgresql

# MongoDB
# Windows: Check Services or run
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl status mongod

# Redis (if using)
# Windows: Start Redis Stack container
docker start redis-stack

# macOS
brew services start redis

# Linux
sudo systemctl start redis
```

### 2. Start All Services with PM2 (Recommended)

#### Using NPM Scripts
```bash
# Start all services in development mode
npm run dev

# Check service status
npm run dev:status

# View real-time logs
npm run dev:logs

# Open monitoring dashboard
npm run dev:monit
```

#### Using Direct PM2 Commands
```bash
# Start with PM2 configuration
pm2 start ecosystem.config.js

# Monitor services
pm2 monit

# Check status
pm2 status

# View logs
pm2 logs
```

#### Using Management Scripts
```bash
# Linux/macOS
./pm2.sh start

# Windows
pm2.bat start
```

### 3. Verify Service Startup
```bash
# Check if all services are running
npm run dev:status

# Test service endpoints
curl http://localhost:3001/health  # Auth service
curl http://localhost:3002/health  # Club service
curl http://localhost:3003/health  # Event service
curl http://localhost:3004/health  # Finance service
curl http://localhost:3005/health  # Notify service
curl http://localhost:3006/health  # User service
curl http://localhost:3000         # Frontend

# Or use the comprehensive health check
npm run health:check
```

### 4. Access the Application
Once all services are running:

- **Frontend Application**: http://localhost:3000
- **Auth Service API**: http://localhost:3001
- **Club Service API**: http://localhost:3002
- **Event Service API**: http://localhost:3003
- **Finance Service API**: http://localhost:3004
- **Notify Service API**: http://localhost:3005
- **User Service API**: http://localhost:3006

---

## 🔄 Development Workflow

### 1. Daily Development Commands
```bash
# Start development environment
npm run dev

# Check service health
npm run health:check

# View logs for debugging
npm run dev:logs

# Monitor services in real-time
npm run dev:monit

# Stop all services at end of day
npm run dev:stop
```

### 2. Making Code Changes

#### Backend Service Changes
```bash
# Make changes to any service in services/[service-name]/src/
# Services will auto-restart due to PM2 watch mode

# View specific service logs
pm2 logs auth-service

# Restart specific service if needed
pm2 restart auth-service

# Reload specific service (zero-downtime)
pm2 reload auth-service
```

#### Frontend Changes
```bash
# Make changes to new-frontend/
# Next.js has built-in hot reload, changes appear immediately

# If issues occur, restart frontend service
pm2 restart frontend

# Or restart frontend manually
cd new-frontend
npm run dev
```

### 3. Database Migrations
```bash
# Auth Service (example)
cd services/auth

# Create new migration
npx sequelize-cli migration:generate --name add-new-feature

# Edit migration file in migrations/ directory
# Run migration
npm run migrate
# or
npx sequelize-cli db:migrate

cd ../..
```

### 4. Adding New Dependencies
```bash
# Add dependency to specific service
cd services/auth
npm install new-package
cd ../..

# Add dependency to frontend
cd new-frontend
npm install new-package
cd ..

# Add development dependency to root
npm install --save-dev new-dev-package
```

---

## 📜 Script Execution & Management

### 1. NPM Scripts Reference
```bash
# Setup and Installation
npm run setup                    # Complete setup (dependencies + logs directory)
npm run install:all             # Install all dependencies
npm run install:services        # Install only service dependencies
npm run install:frontend        # Install only frontend dependencies

# Development
npm run dev                      # Start all services
npm run dev:logs                 # View all logs
npm run dev:status               # Check service status
npm run dev:stop                 # Stop all services
npm run dev:restart              # Restart all services
npm run dev:reload               # Zero-downtime reload
npm run dev:delete               # Remove from PM2
npm run dev:monit                # Monitoring dashboard

# Production
npm start                        # Start in production mode
npm run stop                     # Stop all services
npm run restart                  # Restart all services
npm run delete                   # Delete all processes
npm run logs                     # View logs
npm run monit                    # Monitoring dashboard
npm run status                   # Check status

# Health and Monitoring
npm run health                   # PM2 health check
npm run health:check             # Comprehensive health check
npm run health:watch             # Continuous health monitoring

# Maintenance
npm run reset                    # Reset PM2 completely
```

### 2. Management Script Usage

#### Linux/macOS (pm2.sh)
```bash
# Make executable (first time)
chmod +x pm2.sh

# Available commands
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

#### Windows (pm2.bat)
```cmd
REM Available commands
pm2.bat setup           REM Setup environment
pm2.bat start            REM Start development
pm2.bat start:prod       REM Start production
pm2.bat stop             REM Stop all
pm2.bat restart          REM Restart all
pm2.bat reload           REM Zero-downtime reload
pm2.bat logs             REM View logs
pm2.bat status           REM Check status
pm2.bat monitor          REM Monitoring dashboard
pm2.bat health           REM Health check
pm2.bat delete           REM Delete all processes
pm2.bat reset            REM Reset PM2
```

### 3. Database Scripts
```bash
# Navigate to database scripts
cd database_script

# PostgreSQL setup (if script exists)
psql -U club_user -d club_management_dev -f setup-postgresql.sql

# MongoDB setup (if script exists)
mongosh club_management_dev setup-mongodb.js

cd ..
```

### 4. Custom Script Creation
```bash
# Create custom management script
cat > custom-dev.sh << 'EOF'
#!/bin/bash
echo "Starting Club Management System..."
npm run dev
echo "Waiting for services to start..."
sleep 10
npm run health:check
echo "Development environment ready!"
EOF

chmod +x custom-dev.sh
./custom-dev.sh
```

---

## 📊 Monitoring & Health Checks

### 1. Built-in Health Monitoring
```bash
# Comprehensive health check (one-time)
npm run health:check

# Continuous health monitoring (updates every 30 seconds)
npm run health:watch

# Basic PM2 health check
npm run health
```

### 2. Real-time Monitoring
```bash
# PM2 monitoring dashboard
npm run dev:monit

# Service status
npm run dev:status

# Real-time logs
npm run dev:logs

# Specific service logs
pm2 logs auth-service
pm2 logs frontend --lines 50
```

### 3. Performance Monitoring
```bash
# PM2 performance monitoring
pm2 monit

# Service resource usage
pm2 status

# Detailed service information
pm2 describe auth-service
pm2 describe frontend
```

### 4. Log Management
```bash
# View logs by service
pm2 logs auth-service
pm2 logs club-service
pm2 logs frontend

# View logs with specific number of lines
pm2 logs --lines 100

# Clear all logs
pm2 flush

# Reload log configuration
pm2 reloadLogs
```

### 5. Custom Health Check Script
The project includes a comprehensive health check script at `scripts/health-check.js`:

```bash
# Run health check with custom options
node scripts/health-check.js

# Watch mode (continuous monitoring)
node scripts/health-check.js --watch

# Custom interval (in seconds)
node scripts/health-check.js --watch --interval=60
```

---

## 🌐 Production Deployment

### 1. Production Environment Setup
```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit production environment variables
nano .env.production

# Key production settings:
# - Strong JWT secrets
# - Production database credentials
# - External service API keys
# - Secure CORS origins
# - Rate limiting configurations
```

### 2. Production Build
```bash
# Build frontend for production
cd new-frontend
npm run build
cd ..

# Verify production build
ls -la new-frontend/.next/
```

### 3. Production Startup
```bash
# Start all services in production mode
npm start

# Or using PM2 directly
pm2 start ecosystem.config.js --env production

# Save PM2 configuration for auto-restart
pm2 save
pm2 startup
```

### 4. Production Monitoring
```bash
# Monitor production services
pm2 monit

# Check service status
pm2 status

# View production logs
pm2 logs

# Health check in production
npm run health:check
```

### 5. Production Maintenance
```bash
# Zero-downtime reload (for updates)
pm2 reload ecosystem.config.js

# Restart all services
pm2 restart ecosystem.config.js

# Stop all services
pm2 stop ecosystem.config.js
```

---

## 🐛 Troubleshooting

### 1. Common Installation Issues

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# If version is less than 18, update Node.js
# Use nvm (Node Version Manager) for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### NPM Permission Issues (Linux/macOS)
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### Port Already in Use
```bash
# Find process using port (Linux/macOS)
lsof -i :3001
kill -9 <process_id>

# Find process using port (Windows)
netstat -ano | findstr :3001
taskkill /PID <process_id> /F

# Or use different ports in .env file
```

### 2. Database Connection Issues

#### PostgreSQL Connection Problems
```bash
# Check if PostgreSQL is running
# Linux/macOS
sudo systemctl status postgresql
# or
brew services list | grep postgresql

# Windows
net start | findstr postgres

# Test connection
psql -h localhost -U postgres -c "SELECT version();"

# Check PostgreSQL logs
# Linux
sudo tail -f /var/log/postgresql/postgresql-*-main.log
# macOS
tail -f /opt/homebrew/var/log/postgres.log
```

#### MongoDB Connection Problems
```bash
# Check if MongoDB is running
# Linux/macOS
sudo systemctl status mongod
# or
brew services list | grep mongodb

# Windows
net start | findstr MongoDB

# Test connection
mongosh --eval "db.adminCommand('ismaster')"

# Check MongoDB logs
# Linux
sudo tail -f /var/log/mongodb/mongod.log
# macOS
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

### 3. PM2 Issues

#### PM2 Not Starting Services
```bash
# Check PM2 daemon status
pm2 ping

# Restart PM2 daemon
pm2 kill
pm2 resurrect

# Check PM2 logs
pm2 logs

# Verify ecosystem configuration
pm2 ecosystem ecosystem.config.js
```

#### Service Keeps Restarting
```bash
# Check service logs for errors
pm2 logs auth-service

# Increase restart delay in ecosystem.config.js
# restart_delay: 4000 -> 10000

# Check service health
npm run health:check

# Restart specific service
pm2 restart auth-service
```

### 4. Application-Specific Issues

#### Frontend Not Loading
```bash
# Check if frontend service is running
pm2 status | grep frontend

# Check frontend logs
pm2 logs frontend

# Restart frontend service
pm2 restart frontend

# Check Next.js build
cd new-frontend
rm -rf .next
npm run build
cd ..
```

#### API Endpoints Not Responding
```bash
# Test individual service endpoints
curl -v http://localhost:3001/health
curl -v http://localhost:3002/health

# Check service-specific logs
pm2 logs auth-service
pm2 logs club-service

# Verify environment variables
cat .env | grep -E "(DB_|MONGODB_|JWT_)"
```

#### Database Migration Errors
```bash
# Check database connection
psql -U club_user -d club_management_dev -c "SELECT version();"

# Run migrations manually
cd services/auth
npx sequelize-cli db:migrate
cd ../..

# Check migration status
cd services/auth
npx sequelize-cli db:migrate:status
cd ../..
```

### 5. Performance Issues

#### High Memory Usage
```bash
# Check service memory usage
pm2 status

# Monitor detailed resource usage
pm2 monit

# Restart memory-heavy services
pm2 restart auth-service

# Set memory limits in ecosystem.config.js
# max_memory_restart: '500M'
```

#### Slow Response Times
```bash
# Check service logs for slow queries
pm2 logs | grep -i "slow"

# Monitor database performance
# PostgreSQL
psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# MongoDB
mongosh --eval "db.currentOp()"

# Check network connectivity
ping localhost
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/health
```

### 6. Environment-Specific Issues

#### Windows-Specific Issues
```powershell
# PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Path issues
$env:PATH += ";C:\Program Files\nodejs"

# File path length issues
git config --system core.longpaths true
```

#### macOS-Specific Issues
```bash
# Xcode Command Line Tools
xcode-select --install

# Homebrew permissions
sudo chown -R $(whoami) /opt/homebrew

# macOS firewall blocking connections
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

#### Linux-Specific Issues
```bash
# File descriptor limits
ulimit -n 65536
echo 'fs.file-max = 65536' | sudo tee -a /etc/sysctl.conf

# systemd service limits
sudo systemctl edit --full postgresql
# Add: LimitNOFILE=65536

# SELinux issues (if applicable)
sudo setsebool -P httpd_can_network_connect 1
```

---

## 📚 Quick Reference

### Essential Commands Cheat Sheet

#### First-Time Setup
```bash
# Complete setup from scratch
git clone https://github.com/quockhanh41/club-management-system.git
cd club-management-system
npm run setup
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### Daily Development
```bash
npm run dev           # Start all services
npm run dev:status    # Check status
npm run dev:logs      # View logs
npm run dev:monit     # Monitor services
npm run dev:stop      # Stop all services
```

#### Health & Monitoring
```bash
npm run health:check  # Comprehensive health check
npm run health:watch  # Continuous monitoring
pm2 monit            # PM2 monitoring dashboard
pm2 logs             # View all logs
```

#### Service Management
```bash
pm2 start ecosystem.config.js    # Start all services
pm2 stop all                     # Stop all services
pm2 restart all                  # Restart all services
pm2 reload all                   # Zero-downtime reload
pm2 delete all                   # Remove all processes
```

#### Troubleshooting
```bash
npm run reset         # Reset PM2 completely
pm2 kill              # Kill PM2 daemon
pm2 logs <service>    # View specific service logs
npm run health:check  # Check service health
```

### Service Endpoints
- **Frontend**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Club Service**: http://localhost:3002
- **Event Service**: http://localhost:3003
- **Finance Service**: http://localhost:3004
- **Notify Service**: http://localhost:3005
- **User Service**: http://localhost:3006

### Important Files
- `ecosystem.config.js` - PM2 configuration
- `.env` - Environment variables
- `package.json` - NPM scripts and dependencies
- `PM2_GUIDE.md` - Detailed PM2 documentation
- `logs/` - Application logs directory

### Getting Help
1. Check service logs: `npm run dev:logs`
2. Run health check: `npm run health:check`
3. Check PM2 status: `pm2 status`
4. Review this guide's troubleshooting section
5. Check individual service README files

---

## 🎉 Conclusion

You now have a complete setup of the Club Management System with:

✅ **All prerequisites installed** (Node.js, databases, tools)  
✅ **Source code configured** with proper environment variables  
✅ **Dependencies installed** for all services  
✅ **Database systems configured** and ready  
✅ **PM2 process management** for easy service control  
✅ **Monitoring and health checks** for system oversight  
✅ **Development workflow** established  
✅ **Production deployment** procedures documented  
✅ **Troubleshooting guide** for common issues  

The system is now ready for development and can be easily managed through simple commands. Use `npm run dev` to start developing and `npm run health:check` to verify everything is working correctly.

Happy coding! 🚀
