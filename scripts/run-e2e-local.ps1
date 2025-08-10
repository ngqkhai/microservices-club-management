# E2E Test Runner for Local Development (PowerShell)
# This script starts the full stack and runs E2E tests

param(
    [string]$Mode = "",
    [string]$TestFile = ""
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Status "🚀 Starting Club Management System E2E Tests"

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Error-Custom "Docker is not running. Please start Docker and try again."
    exit 1
}

# Check if docker-compose is available
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
}

# Set environment variables for E2E testing
$env:NODE_ENV = "test"
$env:API_GATEWAY_SECRET = "test-secret-e2e"
$env:MONGODB_URI = "mongodb://localhost:27017/club_e2e_test"
$env:POSTGRES_URL = "postgresql://postgres:postgres@localhost:5432/auth_e2e_test"
$env:BASE_URL = "http://localhost:3000"
$env:API_GATEWAY_URL = "http://localhost:8000"

Write-Status "Environment variables set for E2E testing"

# Function to cleanup on exit
function Cleanup {
    Write-Warning "Stopping services..."
    docker-compose down
    Write-Success "Services stopped"
}

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Status "Installing dependencies..."
    npm install
}

# Install Playwright browsers if needed
$playwrightPath = "$env:USERPROFILE\AppData\Local\ms-playwright"
if (!(Test-Path $playwrightPath)) {
    Write-Status "Installing Playwright browsers..."
    npx playwright install
}

# Stop any existing services
Write-Status "Stopping any existing services..."
docker-compose down

# Start services
Write-Status "Starting services with docker-compose..."
docker-compose up -d

# Wait for services to be ready
Write-Status "Waiting for services to start..."
Start-Sleep -Seconds 10

# Check if services are responding
Write-Status "Checking service health..."

# Wait for frontend
$maxAttempts = 30
$attempt = 0
do {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend is ready"
            break
        }
    } catch {
        # Continue trying
    }
    $attempt++
    if ($attempt -eq $maxAttempts) {
        Write-Error-Custom "Frontend failed to start after $maxAttempts attempts"
        Cleanup
        exit 1
    }
    Start-Sleep -Seconds 2
} while ($attempt -lt $maxAttempts)

# Wait for API Gateway
$attempt = 0
do {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "API Gateway is ready"
            break
        }
    } catch {
        # Continue trying
    }
    $attempt++
    if ($attempt -eq $maxAttempts) {
        Write-Error-Custom "API Gateway failed to start after $maxAttempts attempts"
        Cleanup
        exit 1
    }
    Start-Sleep -Seconds 2
} while ($attempt -lt $maxAttempts)

# Additional wait for all services to fully initialize
Write-Status "Waiting for all services to fully initialize..."
Start-Sleep -Seconds 20

# Run E2E tests
Write-Status "Running E2E tests..."

try {
    switch ($Mode.ToLower()) {
        "ui" {
            Write-Status "Running tests with UI..."
            npm run test:e2e:ui
        }
        "headed" {
            Write-Status "Running tests in headed mode..."
            npm run test:e2e:headed
        }
        "debug" {
            Write-Status "Running tests in debug mode..."
            npx playwright test --debug
        }
        default {
            if ($TestFile) {
                Write-Status "Running specific test: $TestFile"
                npx playwright test $TestFile
            } else {
                Write-Status "Running all E2E tests..."
                npm run test:e2e
            }
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All E2E tests passed!"
        Write-Status "View test report with: npx playwright show-report"
    } else {
        Write-Error-Custom "Some E2E tests failed"
        Write-Status "View test report with: npx playwright show-report"
        Cleanup
        exit 1
    }
} finally {
    Cleanup
}
