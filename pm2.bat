@echo off
REM PM2 Management Script for Club Management System (Windows)
REM This script provides easy commands to manage all microservices using PM2

setlocal enabledelayedexpansion

REM Function to print colored output (simplified for Windows)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

goto :main

:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:check_pm2
pm2 --version >nul 2>&1
if !errorlevel! neq 0 (
    call :print_error "PM2 is not installed. Installing PM2..."
    npm install -g pm2
    if !errorlevel! equ 0 (
        call :print_status "PM2 installed successfully"
    ) else (
        call :print_error "Failed to install PM2"
        exit /b 1
    )
) else (
    call :print_status "PM2 is already installed"
)
goto :eof

:setup
call :print_status "Setting up Club Management System..."

call :print_status "Installing root dependencies..."
npm install
if !errorlevel! neq 0 (
    call :print_error "Failed to install root dependencies"
    exit /b 1
)

if not exist "logs" mkdir logs

call :print_status "Installing service dependencies..."
npm run install:services
if !errorlevel! neq 0 (
    call :print_error "Failed to install service dependencies"
    exit /b 1
)

call :print_status "Installing frontend dependencies..."
npm run install:frontend
if !errorlevel! neq 0 (
    call :print_error "Failed to install frontend dependencies"
    exit /b 1
)

call :print_status "Setup completed successfully!"
goto :eof

:start
call :print_status "Starting all services with PM2..."
call :check_pm2
pm2 start ecosystem.config.js
if !errorlevel! equ 0 (
    call :print_status "All services started successfully!"
    call :print_status "Use 'npm run dev:status' to check service status"
    call :print_status "Use 'npm run dev:logs' to view logs"
    call :print_status "Use 'npm run dev:monit' to monitor services"
) else (
    call :print_error "Failed to start services"
    exit /b 1
)
goto :eof

:start_prod
call :print_status "Starting all services in production mode..."
call :check_pm2
pm2 start ecosystem.config.js --env production
if !errorlevel! equ 0 (
    call :print_status "All services started in production mode!"
) else (
    call :print_error "Failed to start services in production mode"
    exit /b 1
)
goto :eof

:stop
call :print_status "Stopping all services..."
pm2 stop ecosystem.config.js
call :print_status "All services stopped"
goto :eof

:restart
call :print_status "Restarting all services..."
pm2 restart ecosystem.config.js
call :print_status "All services restarted"
goto :eof

:reload
call :print_status "Reloading all services (zero-downtime)..."
pm2 reload ecosystem.config.js
call :print_status "All services reloaded"
goto :eof

:delete_all
call :print_warning "This will delete all PM2 processes. Are you sure? (y/N)"
set /p response="Enter your choice: "
if /i "!response!"=="y" (
    pm2 delete ecosystem.config.js
    call :print_status "All services deleted from PM2"
) else (
    call :print_status "Operation cancelled"
)
goto :eof

:logs
call :print_status "Showing logs for all services..."
pm2 logs
goto :eof

:status
call :print_status "Checking service status..."
pm2 status
goto :eof

:monitor
call :print_status "Opening PM2 monitoring dashboard..."
pm2 monit
goto :eof

:health
call :print_status "Checking PM2 health..."
pm2 ping
goto :eof

:reset
call :print_warning "This will kill PM2 daemon and delete all processes. Are you sure? (y/N)"
set /p response="Enter your choice: "
if /i "!response!"=="y" (
    pm2 delete all >nul 2>&1
    pm2 kill
    call :print_status "PM2 reset completed"
) else (
    call :print_status "Operation cancelled"
)
goto :eof

:usage
echo Usage: %~nx0 {setup^|start^|start:prod^|stop^|restart^|reload^|delete^|logs^|status^|monitor^|health^|reset}
echo.
echo Commands:
echo   setup        - Install dependencies and setup environment
echo   start^|dev    - Start all services in development mode
echo   start:prod   - Start all services in production mode
echo   stop         - Stop all services
echo   restart      - Restart all services
echo   reload       - Reload all services (zero-downtime)
echo   delete       - Delete all services from PM2
echo   logs         - Show logs for all services
echo   status       - Show status of all services
echo   monitor      - Open PM2 monitoring dashboard
echo   health       - Check PM2 health
echo   reset        - Reset PM2 (kill daemon and delete all)
echo.
echo Examples:
echo   %~nx0 setup     # First time setup
echo   %~nx0 start     # Start all services
echo   %~nx0 logs      # View logs
echo   %~nx0 status    # Check status
goto :eof

:main
if "%1"=="setup" (
    call :setup
) else if "%1"=="start" (
    call :start
) else if "%1"=="dev" (
    call :start
) else if "%1"=="start:prod" (
    call :start_prod
) else if "%1"=="prod" (
    call :start_prod
) else if "%1"=="stop" (
    call :stop
) else if "%1"=="restart" (
    call :restart
) else if "%1"=="reload" (
    call :reload
) else if "%1"=="delete" (
    call :delete_all
) else if "%1"=="logs" (
    call :logs
) else if "%1"=="status" (
    call :status
) else if "%1"=="monitor" (
    call :monitor
) else if "%1"=="monit" (
    call :monitor
) else if "%1"=="health" (
    call :health
) else if "%1"=="reset" (
    call :reset
) else (
    call :usage
    exit /b 1
)

endlocal
