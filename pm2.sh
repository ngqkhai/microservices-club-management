#!/bin/bash

# PM2 Management Script for Club Management System
# This script provides easy commands to manage all microservices using PM2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 is not installed. Installing PM2..."
        npm install -g pm2
        print_status "PM2 installed successfully"
    else
        print_status "PM2 is already installed"
    fi
}

# Function to setup the environment
setup() {
    print_status "Setting up Club Management System..."
    
    # Install dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Create logs directory
    mkdir -p logs
    
    # Install all service dependencies
    print_status "Installing service dependencies..."
    npm run install:services
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm run install:frontend
    
    print_status "Setup completed successfully!"
}

# Function to start all services
start() {
    print_status "Starting all services with PM2..."
    check_pm2
    pm2 start ecosystem.config.js
    print_status "All services started successfully!"
    print_status "Use 'npm run dev:status' to check service status"
    print_status "Use 'npm run dev:logs' to view logs"
    print_status "Use 'npm run dev:monit' to monitor services"
}

# Function to start in production mode
start_prod() {
    print_status "Starting all services in production mode..."
    check_pm2
    pm2 start ecosystem.config.js --env production
    print_status "All services started in production mode!"
}

# Function to stop all services
stop() {
    print_status "Stopping all services..."
    pm2 stop ecosystem.config.js
    print_status "All services stopped"
}

# Function to restart all services
restart() {
    print_status "Restarting all services..."
    pm2 restart ecosystem.config.js
    print_status "All services restarted"
}

# Function to reload all services (zero-downtime)
reload() {
    print_status "Reloading all services (zero-downtime)..."
    pm2 reload ecosystem.config.js
    print_status "All services reloaded"
}

# Function to delete all services
delete_all() {
    print_warning "This will delete all PM2 processes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        pm2 delete ecosystem.config.js
        print_status "All services deleted from PM2"
    else
        print_status "Operation cancelled"
    fi
}

# Function to show logs
logs() {
    print_status "Showing logs for all services..."
    pm2 logs
}

# Function to show status
status() {
    print_status "Checking service status..."
    pm2 status
}

# Function to show monitoring
monitor() {
    print_status "Opening PM2 monitoring dashboard..."
    pm2 monit
}

# Function to show health
health() {
    print_status "Checking PM2 health..."
    pm2 ping
}

# Function to reset PM2 (kill daemon and delete all processes)
reset() {
    print_warning "This will kill PM2 daemon and delete all processes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        pm2 delete all 2>/dev/null || true
        pm2 kill
        print_status "PM2 reset completed"
    else
        print_status "Operation cancelled"
    fi
}

# Main script logic
case "$1" in
    "setup")
        setup
        ;;
    "start"|"dev")
        start
        ;;
    "start:prod"|"prod")
        start_prod
        ;;
    "stop")
        stop
        ;;
    "restart")
        restart
        ;;
    "reload")
        reload
        ;;
    "delete")
        delete_all
        ;;
    "logs")
        logs
        ;;
    "status")
        status
        ;;
    "monitor"|"monit")
        monitor
        ;;
    "health")
        health
        ;;
    "reset")
        reset
        ;;
    *)
        echo "Usage: $0 {setup|start|start:prod|stop|restart|reload|delete|logs|status|monitor|health|reset}"
        echo ""
        echo "Commands:"
        echo "  setup        - Install dependencies and setup environment"
        echo "  start|dev    - Start all services in development mode"
        echo "  start:prod   - Start all services in production mode"
        echo "  stop         - Stop all services"
        echo "  restart      - Restart all services"
        echo "  reload       - Reload all services (zero-downtime)"
        echo "  delete       - Delete all services from PM2"
        echo "  logs         - Show logs for all services"
        echo "  status       - Show status of all services"
        echo "  monitor      - Open PM2 monitoring dashboard"
        echo "  health       - Check PM2 health"
        echo "  reset        - Reset PM2 (kill daemon and delete all)"
        echo ""
        echo "Examples:"
        echo "  $0 setup     # First time setup"
        echo "  $0 start     # Start all services"
        echo "  $0 logs      # View logs"
        echo "  $0 status    # Check status"
        exit 1
        ;;
esac
