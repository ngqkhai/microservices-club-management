# =============================================================================
# Run Tests for All Services
# =============================================================================
# Usage:
#   .\scripts\test-all.ps1              # Run all tests
#   .\scripts\test-all.ps1 -Coverage    # Run with coverage
#   .\scripts\test-all.ps1 -Service auth # Run tests for specific service
# =============================================================================

param(
    [switch]$Coverage,
    [string]$Service
)

$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot

$Services = @("auth", "club", "event", "image", "notify")

# Colors for output
function Write-Color($Text, $Color) {
    Write-Host $Text -ForegroundColor $Color
}

function Run-ServiceTests($ServiceName) {
    $ServicePath = Join-Path $RootDir "services\$ServiceName"
    
    if (-not (Test-Path $ServicePath)) {
        Write-Color "  Service path not found: $ServicePath" Red
        return $false
    }
    
    Write-Color "`n========================================" Cyan
    Write-Color "  Testing: $ServiceName" Cyan
    Write-Color "========================================" Cyan
    
    Push-Location $ServicePath
    
    try {
        # Check if node_modules exists
        if (-not (Test-Path "node_modules")) {
            Write-Color "  Installing dependencies..." Yellow
            npm install
        }
        
        # Run tests
        if ($Coverage) {
            Write-Color "  Running tests with coverage..." Yellow
            npm run test:coverage
        } else {
            Write-Color "  Running tests..." Yellow
            npm test
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Color "  PASSED" Green
            return $true
        } else {
            Write-Color "  FAILED" Red
            return $false
        }
    }
    catch {
        Write-Color "  ERROR: $_" Red
        return $false
    }
    finally {
        Pop-Location
    }
}

# Main execution
Write-Color "`n=== Running Tests for Microservices ===" Magenta

$Results = @{}
$Failed = @()

if ($Service) {
    # Run tests for specific service
    if ($Services -contains $Service) {
        $Result = Run-ServiceTests $Service
        $Results[$Service] = $Result
        if (-not $Result) { $Failed += $Service }
    } else {
        Write-Color "Unknown service: $Service" Red
        Write-Color "Available services: $($Services -join ', ')" Yellow
        exit 1
    }
} else {
    # Run tests for all services
    foreach ($svc in $Services) {
        $Result = Run-ServiceTests $svc
        $Results[$svc] = $Result
        if (-not $Result) { $Failed += $svc }
    }
}

# Summary
Write-Color "`n========================================" Cyan
Write-Color "  TEST SUMMARY" Cyan
Write-Color "========================================" Cyan

foreach ($svc in $Results.Keys) {
    $Status = if ($Results[$svc]) { "PASSED" } else { "FAILED" }
    $Color = if ($Results[$svc]) { "Green" } else { "Red" }
    Write-Color "  $svc : $Status" $Color
}

if ($Failed.Count -gt 0) {
    Write-Color "`n  $($Failed.Count) service(s) failed tests" Red
    exit 1
} else {
    Write-Color "`n  All tests passed!" Green
    exit 0
}
