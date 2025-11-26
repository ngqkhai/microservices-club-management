#!/bin/bash
# Seed All Databases Script
# Run this after databases are up and running

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

UNDO=false

usage() {
    echo -e "${MAGENTA}Club Management System - Database Seeder${NC}"
    echo ""
    echo "Usage:"
    echo "  ./seed-all.sh           # Seed all databases"
    echo "  ./seed-all.sh --undo    # Remove seeded data"
    echo "  ./seed-all.sh --help    # Show this help"
    echo ""
    echo "Services seeded:"
    echo "  - auth-service (PostgreSQL)"
    echo "  - club-service (MongoDB)"
    echo "  - event-service (MongoDB)"
    echo ""
    echo "Test Credentials (after seeding):"
    echo "  admin@clubmanagement.com / AdminPassword123!"
    echo "  user@clubmanagement.com / UserPassword123!"
    echo "  manager@clubmanagement.com / ManagerPassword123!"
    exit 0
}

log() {
    local type=$1
    local message=$2
    case $type in
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        "ERROR")   echo -e "${RED}[ERROR]${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[WARNING]${NC} $message" ;;
        *)         echo -e "${CYAN}[INFO]${NC} $message" ;;
    esac
}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --undo) UNDO=true ;;
        --help|-h) usage ;;
        *) echo "Unknown parameter: $1"; usage ;;
    esac
    shift
done

ACTION="seed"
ACTION_TEXT="Seeding"
if [ "$UNDO" = true ]; then
    ACTION="seed:undo"
    ACTION_TEXT="Removing"
fi

echo ""
echo -e "${MAGENTA}========================================${NC}"
echo -e "${MAGENTA}  Club Management - Database Seeder${NC}"
echo -e "${MAGENTA}========================================${NC}"
echo ""

# Auth Service (PostgreSQL)
log "INFO" "$ACTION_TEXT auth-service database..."
cd "$ROOT_DIR/services/auth"
export DATABASE_URL="postgresql://postgres:postgres_local_dev@localhost:5432/club_auth_db"
if npm run $ACTION; then
    log "SUCCESS" "auth-service $ACTION_TEXT complete!"
else
    log "ERROR" "auth-service $ACTION_TEXT failed!"
fi

echo ""

# Club Service (MongoDB)
log "INFO" "$ACTION_TEXT club-service database..."
cd "$ROOT_DIR/services/club"
export MONGODB_URI="mongodb://clubuser:clubpass@localhost:27017/club_service_db?authSource=club_service_db"
if npm run $ACTION; then
    log "SUCCESS" "club-service $ACTION_TEXT complete!"
else
    log "ERROR" "club-service $ACTION_TEXT failed!"
fi

echo ""

# Event Service (MongoDB)
log "INFO" "$ACTION_TEXT event-service database..."
cd "$ROOT_DIR/services/event"
export MONGODB_URI="mongodb://eventuser:eventpass@localhost:27018/event_service_db?authSource=event_service_db"
if npm run $ACTION; then
    log "SUCCESS" "event-service $ACTION_TEXT complete!"
else
    log "ERROR" "event-service $ACTION_TEXT failed!"
fi

echo ""
echo -e "${MAGENTA}========================================${NC}"

if [ "$UNDO" = false ]; then
    echo ""
    log "SUCCESS" "All databases seeded!"
    echo ""
    echo -e "${YELLOW}Test Credentials:${NC}"
    echo "  Admin:   admin@clubmanagement.com / AdminPassword123!"
    echo "  User:    user@clubmanagement.com / UserPassword123!"
    echo "  Manager: manager@clubmanagement.com / ManagerPassword123!"
    echo ""
else
    log "SUCCESS" "All seeded data removed!"
fi

