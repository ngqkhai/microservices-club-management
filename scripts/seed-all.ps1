# Seed All Databases Script
# Run this after databases are up and running

param(
    [switch]$Undo,
    [switch]$Help
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath

if ($Help) {
    Write-Host @"
Club Management System - Database Seeder

Usage:
    .\seed-all.ps1           # Seed all databases
    .\seed-all.ps1 -Undo     # Remove seeded data
    .\seed-all.ps1 -Help     # Show this help

Services seeded:
    - auth-service (PostgreSQL)
    - club-service (MongoDB)
    - event-service (MongoDB)

Test Credentials (after seeding):
    admin@clubmanagement.com / AdminPassword123!
    user@clubmanagement.com / UserPassword123!
    manager@clubmanagement.com / ManagerPassword123!
"@
    exit 0
}

function Write-Status($message, $type = "INFO") {
    $color = switch ($type) {
        "SUCCESS" { "Green" }
        "ERROR"   { "Red" }
        "WARNING" { "Yellow" }
        default   { "Cyan" }
    }
    Write-Host "[$type] $message" -ForegroundColor $color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Club Management - Database Seeder" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

$action = if ($Undo) { "seed:undo" } else { "seed" }
$actionText = if ($Undo) { "Removing" } else { "Seeding" }

# Auth Service (PostgreSQL)
Write-Status "$actionText auth-service database..."
Push-Location "$rootPath\services\auth"
try {
    $env:DATABASE_URL = "postgresql://postgres:postgres_local_dev@localhost:5432/club_auth_db"
    npm run $action 2>&1 | ForEach-Object { Write-Host "  $_" }
    if ($LASTEXITCODE -eq 0) {
        Write-Status "auth-service $actionText complete!" "SUCCESS"
    } else {
        Write-Status "auth-service $actionText failed!" "ERROR"
    }
} finally {
    Pop-Location
}

Write-Host ""

# Club Service (MongoDB)
Write-Status "$actionText club-service database..."
Push-Location "$rootPath\services\club"
try {
    $env:MONGODB_URI = "mongodb://clubuser:clubpass@localhost:27017/club_service_db?authSource=club_service_db"
    npm run $action 2>&1 | ForEach-Object { Write-Host "  $_" }
    if ($LASTEXITCODE -eq 0) {
        Write-Status "club-service $actionText complete!" "SUCCESS"
    } else {
        Write-Status "club-service $actionText failed!" "ERROR"
    }
} finally {
    Pop-Location
}

Write-Host ""

# Event Service (MongoDB)
Write-Status "$actionText event-service database..."
Push-Location "$rootPath\services\event"
try {
    $env:MONGODB_URI = "mongodb://eventuser:eventpass@localhost:27018/event_service_db?authSource=event_service_db"
    npm run $action 2>&1 | ForEach-Object { Write-Host "  $_" }
    if ($LASTEXITCODE -eq 0) {
        Write-Status "event-service $actionText complete!" "SUCCESS"
    } else {
        Write-Status "event-service $actionText failed!" "ERROR"
    }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta

if (-not $Undo) {
    Write-Host ""
    Write-Status "All databases seeded!" "SUCCESS"
    Write-Host ""
    Write-Host "Test Credentials:" -ForegroundColor Yellow
    Write-Host "  Admin:   admin@clubmanagement.com / AdminPassword123!" -ForegroundColor White
    Write-Host "  User:    user@clubmanagement.com / UserPassword123!" -ForegroundColor White
    Write-Host "  Manager: manager@clubmanagement.com / ManagerPassword123!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Status "All seeded data removed!" "SUCCESS"
}

