#!/bin/bash
# =============================================================================
# Run Tests for All Services
# =============================================================================
# Usage:
#   ./scripts/test-all.sh              # Run all tests
#   ./scripts/test-all.sh --coverage   # Run with coverage
#   ./scripts/test-all.sh --service auth # Run tests for specific service
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

SERVICES=("auth" "club" "event" "image" "notify")
COVERAGE=false
SERVICE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --coverage|-c)
            COVERAGE=true
            shift
            ;;
        --service|-s)
            SERVICE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

run_service_tests() {
    local service_name=$1
    local service_path="$ROOT_DIR/services/$service_name"
    
    if [ ! -d "$service_path" ]; then
        echo -e "${RED}  Service path not found: $service_path${NC}"
        return 1
    fi
    
    echo -e "\n${CYAN}========================================"
    echo -e "  Testing: $service_name"
    echo -e "========================================${NC}"
    
    cd "$service_path"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}  Installing dependencies...${NC}"
        npm install
    fi
    
    # Run tests
    if [ "$COVERAGE" = true ]; then
        echo -e "${YELLOW}  Running tests with coverage...${NC}"
        npm run test:coverage
    else
        echo -e "${YELLOW}  Running tests...${NC}"
        npm test
    fi
    
    local exit_code=$?
    cd "$ROOT_DIR"
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}  PASSED${NC}"
        return 0
    else
        echo -e "${RED}  FAILED${NC}"
        return 1
    fi
}

# Main execution
echo -e "\n${MAGENTA}=== Running Tests for Microservices ===${NC}"

declare -A results
failed=()

if [ -n "$SERVICE" ]; then
    # Run tests for specific service
    if [[ " ${SERVICES[@]} " =~ " ${SERVICE} " ]]; then
        if run_service_tests "$SERVICE"; then
            results[$SERVICE]="passed"
        else
            results[$SERVICE]="failed"
            failed+=("$SERVICE")
        fi
    else
        echo -e "${RED}Unknown service: $SERVICE${NC}"
        echo -e "${YELLOW}Available services: ${SERVICES[*]}${NC}"
        exit 1
    fi
else
    # Run tests for all services
    for svc in "${SERVICES[@]}"; do
        if run_service_tests "$svc"; then
            results[$svc]="passed"
        else
            results[$svc]="failed"
            failed+=("$svc")
        fi
    done
fi

# Summary
echo -e "\n${CYAN}========================================"
echo -e "  TEST SUMMARY"
echo -e "========================================${NC}"

for svc in "${!results[@]}"; do
    if [ "${results[$svc]}" = "passed" ]; then
        echo -e "  ${GREEN}$svc : PASSED${NC}"
    else
        echo -e "  ${RED}$svc : FAILED${NC}"
    fi
done

if [ ${#failed[@]} -gt 0 ]; then
    echo -e "\n${RED}  ${#failed[@]} service(s) failed tests${NC}"
    exit 1
else
    echo -e "\n${GREEN}  All tests passed!${NC}"
    exit 0
fi
