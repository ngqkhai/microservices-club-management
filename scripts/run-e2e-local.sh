#!/bin/bash

# E2E Test Runner for Local Development
# This script starts the full stack and runs E2E tests

set -e

echo "🚀 Starting Club Management System E2E Tests"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

# Set environment variables for E2E testing
export NODE_ENV=test
export API_GATEWAY_SECRET=test-secret-e2e
export MONGODB_URI=mongodb://localhost:27017/club_e2e_test
export POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/auth_e2e_test
export BASE_URL=http://localhost:3000
export API_GATEWAY_URL=http://localhost:8000

print_status "Environment variables set for E2E testing"

# Function to cleanup on exit
cleanup() {
    print_warning "Stopping services..."
    docker-compose down
    print_success "Services stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Install Playwright browsers if needed
if [ ! -d "$HOME/.cache/ms-playwright" ] && [ ! -d "$HOME/Library/Caches/ms-playwright" ]; then
    print_status "Installing Playwright browsers..."
    npx playwright install
fi

# Stop any existing services
print_status "Stopping any existing services..."
docker-compose down

# Start services
print_status "Starting services with docker-compose..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Check if services are responding
print_status "Checking service health..."

# Wait for frontend
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is ready"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        print_error "Frontend failed to start after $max_attempts attempts"
        exit 1
    fi
    sleep 2
done

# Wait for API Gateway
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "API Gateway is ready"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        print_error "API Gateway failed to start after $max_attempts attempts"
        exit 1
    fi
    sleep 2
done

# Additional wait for all services to fully initialize
print_status "Waiting for all services to fully initialize..."
sleep 20

# Run E2E tests
print_status "Running E2E tests..."

# Check command line arguments
if [ "$1" == "--ui" ]; then
    print_status "Running tests with UI..."
    npm run test:e2e:ui
elif [ "$1" == "--headed" ]; then
    print_status "Running tests in headed mode..."
    npm run test:e2e:headed
elif [ "$1" == "--debug" ]; then
    print_status "Running tests in debug mode..."
    npx playwright test --debug
elif [ -n "$1" ]; then
    print_status "Running specific test: $1"
    npx playwright test "$1"
else
    print_status "Running all E2E tests..."
    npm run test:e2e
fi

# Check test results
if [ $? -eq 0 ]; then
    print_success "All E2E tests passed!"
    print_status "View test report with: npx playwright show-report"
else
    print_error "Some E2E tests failed"
    print_status "View test report with: npx playwright show-report"
    exit 1
fi
