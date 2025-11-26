# =============================================================================
# Local Development Startup Script (PowerShell)
# =============================================================================
# This script starts the local Docker development environment with:
# - PostgreSQL (for auth-service)
# - MongoDB (for club-service, event-service)
# - RabbitMQ (message queue)
# - All microservices
# =============================================================================

param(
    [switch]$DatabasesOnly,
    [switch]$WithTools,
    [switch]$Down,
    [switch]$Logs,
    [switch]$Reset
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Status { param($Message) Write-Host "🔧 $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

# Navigate to project root
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (Test-Path (Join-Path $PSScriptRoot "..")) {
    $ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
}
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=" * 60
Write-Host "🚀 Club Management System - Local Development" -ForegroundColor Magenta
Write-Host "=" * 60
Write-Host ""

# Check for .env.local file
$EnvFile = Join-Path $ProjectRoot ".env.local"
$EnvExample = Join-Path $ProjectRoot "env.local.example"

if (-not (Test-Path $EnvFile)) {
    Write-Warning ".env.local not found!"
    
    if (Test-Path $EnvExample) {
        Write-Status "Creating .env.local from env.local.example..."
        Copy-Item $EnvExample $EnvFile
        Write-Success ".env.local created! Edit it if needed."
    } else {
        Write-Error "env.local.example not found. Please create .env.local manually."
        exit 1
    }
}

# Handle commands
if ($Down) {
    Write-Status "Stopping all containers..."
    docker-compose -f docker-compose.local.yml -f docker-compose.yml --env-file .env.local down
    Write-Success "All containers stopped."
    exit 0
}

if ($Reset) {
    Write-Warning "This will delete all local database data!"
    $confirm = Read-Host "Are you sure? (yes/no)"
    if ($confirm -eq "yes") {
        Write-Status "Stopping containers and removing volumes..."
        docker-compose -f docker-compose.local.yml -f docker-compose.yml --env-file .env.local down -v
        Write-Success "All data reset."
    }
    exit 0
}

if ($Logs) {
    Write-Status "Showing logs (Ctrl+C to exit)..."
    docker-compose -f docker-compose.local.yml -f docker-compose.yml --env-file .env.local logs -f
    exit 0
}

# Start databases
Write-Status "Starting local databases..."
if ($WithTools) {
    docker-compose -f docker-compose.local.yml --env-file .env.local --profile tools up -d
} else {
    docker-compose -f docker-compose.local.yml --env-file .env.local up -d
}

# Wait for databases to be healthy
Write-Status "Waiting for databases to be ready..."

$maxAttempts = 30
$attempt = 0

# Check PostgreSQL
Write-Host "  Checking PostgreSQL..." -NoNewline
while ($attempt -lt $maxAttempts) {
    $result = docker exec club_management_postgres pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Ready!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $attempt++
    Write-Host "." -NoNewline
}
if ($attempt -ge $maxAttempts) {
    Write-Error "PostgreSQL failed to start"
    exit 1
}

# Check MongoDB
$attempt = 0
Write-Host "  Checking MongoDB..." -NoNewline
while ($attempt -lt $maxAttempts) {
    $result = docker exec club_management_mongodb mongosh --eval "db.adminCommand('ping')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Ready!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $attempt++
    Write-Host "." -NoNewline
}
if ($attempt -ge $maxAttempts) {
    Write-Error "MongoDB failed to start"
    exit 1
}

# Check RabbitMQ
$attempt = 0
Write-Host "  Checking RabbitMQ..." -NoNewline
while ($attempt -lt $maxAttempts) {
    $result = docker exec club_management_rabbitmq rabbitmq-diagnostics -q ping 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Ready!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $attempt++
    Write-Host "." -NoNewline
}
if ($attempt -ge $maxAttempts) {
    Write-Error "RabbitMQ failed to start"
    exit 1
}

# Check MinIO
$attempt = 0
Write-Host "  Checking MinIO..." -NoNewline
while ($attempt -lt $maxAttempts) {
    $result = docker exec club_management_minio mc ready local 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Ready!" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 2
    $attempt++
    Write-Host "." -NoNewline
}
if ($attempt -ge $maxAttempts) {
    Write-Warning "MinIO health check timed out (may still be starting)"
}

Write-Success "All databases are ready!"
Write-Host ""

if ($DatabasesOnly) {
    Write-Host "📦 Database containers are running:" -ForegroundColor Cyan
    Write-Host "   PostgreSQL: localhost:5432 (user: postgres, pass: postgres_local_dev)"
    Write-Host "   MongoDB:    localhost:27017 (user: mongo, pass: mongo_local_dev)"
    Write-Host "   RabbitMQ:   localhost:5672 (user: rabbitmq, pass: rabbitmq_local_dev)"
    Write-Host "   RabbitMQ UI: http://localhost:15672"
    Write-Host "   MinIO S3:   localhost:9000 (user: minioadmin, pass: minioadmin_local_dev)"
    Write-Host "   MinIO UI:   http://localhost:9001"
    if ($WithTools) {
        Write-Host "   pgAdmin:    http://localhost:5050 (admin@local.dev / admin_local_dev)"
        Write-Host "   Mongo Express: http://localhost:8081 (admin / admin_local_dev)"
    }
    Write-Host ""
    Write-Host "To start services manually, run: npm run dev (in each service folder)"
    exit 0
}

# Start all services
Write-Status "Starting all services..."
docker-compose -f docker-compose.local.yml -f docker-compose.yml --env-file .env.local up -d

Write-Host ""
Write-Success "All services are starting!"
Write-Host ""
Write-Host "🌐 Access points:" -ForegroundColor Cyan
Write-Host "   Frontend:     http://localhost:3000"
Write-Host "   API Gateway:  http://localhost:8000"
Write-Host "   Auth Service: http://localhost:3001"
Write-Host "   Club Service: http://localhost:3002"
Write-Host "   Event Service: http://localhost:3003"
Write-Host "   Image Service: http://localhost:3004"
Write-Host "   Notify Service: http://localhost:3005"
Write-Host ""
Write-Host "📦 Database access:" -ForegroundColor Cyan
Write-Host "   PostgreSQL: localhost:5432"
Write-Host "   MongoDB:    localhost:27017"
Write-Host "   RabbitMQ:   http://localhost:15672"
Write-Host "   MinIO:      http://localhost:9001 (S3 API: localhost:9000)"
Write-Host ""
Write-Host "📋 Commands:" -ForegroundColor Cyan
Write-Host "   View logs:  .\scripts\start-local.ps1 -Logs"
Write-Host "   Stop all:   .\scripts\start-local.ps1 -Down"
Write-Host "   Reset data: .\scripts\start-local.ps1 -Reset"
Write-Host ""

