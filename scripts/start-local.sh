#!/bin/bash
# =============================================================================
# Local Development Startup Script (Bash)
# =============================================================================
# This script starts the local Docker development environment with:
# - PostgreSQL (for auth-service)
# - MongoDB (for club-service, event-service)
# - RabbitMQ (message queue)
# - All microservices
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Functions
status() { echo -e "${CYAN}🔧 $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "============================================================"
echo -e "${MAGENTA}🚀 Club Management System - Local Development${NC}"
echo "============================================================"
echo ""

# Parse arguments
DATABASES_ONLY=false
WITH_TOOLS=false
DOWN=false
LOGS=false
RESET=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --databases-only) DATABASES_ONLY=true; shift ;;
        --with-tools) WITH_TOOLS=true; shift ;;
        --down) DOWN=true; shift ;;
        --logs) LOGS=true; shift ;;
        --reset) RESET=true; shift ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --databases-only  Only start database containers"
            echo "  --with-tools      Include pgAdmin and Mongo Express"
            echo "  --down            Stop all containers"
            echo "  --logs            Show container logs"
            echo "  --reset           Stop and delete all data"
            echo "  -h, --help        Show this help"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Check for .env.local file
ENV_FILE="$PROJECT_ROOT/.env.local"
ENV_EXAMPLE="$PROJECT_ROOT/env.local.example"

if [ ! -f "$ENV_FILE" ]; then
    warning ".env.local not found!"
    
    if [ -f "$ENV_EXAMPLE" ]; then
        status "Creating .env.local from env.local.example..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        success ".env.local created! Edit it if needed."
    else
        error "env.local.example not found. Please create .env.local manually."
        exit 1
    fi
fi

# Handle commands
if [ "$DOWN" = true ]; then
    status "Stopping all containers..."
    docker-compose -f docker-compose.local.yml -f docker-compose.yml --env-file .env.local down
    success "All containers stopped."
    exit 0
fi

if [ "$RESET" = true ]; then
    warning "This will delete all local database data!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        status "Stopping containers and removing volumes..."
        docker-compose -f docker-compose.local.yml -f docker-compose.yml --env-file .env.local down -v
        success "All data reset."
    fi
    exit 0
fi

if [ "$LOGS" = true ]; then
    status "Showing logs (Ctrl+C to exit)..."
    docker-compose -f docker-compose.local.yml -f docker-compose.yml --env-file .env.local logs -f
    exit 0
fi

# Start databases
status "Starting local databases..."
if [ "$WITH_TOOLS" = true ]; then
    docker-compose -f docker-compose.local.yml --env-file .env.local --profile tools up -d
else
    docker-compose -f docker-compose.local.yml --env-file .env.local up -d
fi

# Wait for databases to be healthy
status "Waiting for databases to be ready..."

MAX_ATTEMPTS=30
ATTEMPT=0

# Check PostgreSQL
echo -n "  Checking PostgreSQL..."
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker exec club_management_postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e " ${GREEN}Ready!${NC}"
        break
    fi
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
done
if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    error "PostgreSQL failed to start"
    exit 1
fi

# Check MongoDB
ATTEMPT=0
echo -n "  Checking MongoDB..."
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker exec club_management_mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e " ${GREEN}Ready!${NC}"
        break
    fi
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
done
if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    error "MongoDB failed to start"
    exit 1
fi

# Check RabbitMQ
ATTEMPT=0
echo -n "  Checking RabbitMQ..."
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker exec club_management_rabbitmq rabbitmq-diagnostics -q ping > /dev/null 2>&1; then
        echo -e " ${GREEN}Ready!${NC}"
        break
    fi
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
done
if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    error "RabbitMQ failed to start"
    exit 1
fi

success "All databases are ready!"
echo ""

if [ "$DATABASES_ONLY" = true ]; then
    echo -e "${CYAN}📦 Database containers are running:${NC}"
    echo "   PostgreSQL: localhost:5432 (user: postgres, pass: postgres_local_dev)"
    echo "   MongoDB:    localhost:27017 (user: mongo, pass: mongo_local_dev)"
    echo "   RabbitMQ:   localhost:5672 (user: rabbitmq, pass: rabbitmq_local_dev)"
    echo "   RabbitMQ UI: http://localhost:15672"
    if [ "$WITH_TOOLS" = true ]; then
        echo "   pgAdmin:    http://localhost:5050 (admin@local.dev / admin_local_dev)"
        echo "   Mongo Express: http://localhost:8081 (admin / admin_local_dev)"
    fi
    echo ""
    echo "To start services manually, run: npm run dev (in each service folder)"
    exit 0
fi

# Start all services
status "Starting all services..."
docker-compose -f docker-compose.local.yml -f docker-compose.yml --env-file .env.local up -d

echo ""
success "All services are starting!"
echo ""
echo -e "${CYAN}🌐 Access points:${NC}"
echo "   Frontend:     http://localhost:3000"
echo "   API Gateway:  http://localhost:8000"
echo "   Auth Service: http://localhost:3001"
echo "   Club Service: http://localhost:3002"
echo "   Event Service: http://localhost:3003"
echo "   Image Service: http://localhost:3004"
echo "   Notify Service: http://localhost:3005"
echo ""
echo -e "${CYAN}📦 Database access:${NC}"
echo "   PostgreSQL: localhost:5432"
echo "   MongoDB:    localhost:27017"
echo "   RabbitMQ:   http://localhost:15672"
echo ""
echo -e "${CYAN}📋 Commands:${NC}"
echo "   View logs:  ./scripts/start-local.sh --logs"
echo "   Stop all:   ./scripts/start-local.sh --down"
echo "   Reset data: ./scripts/start-local.sh --reset"
echo ""

