# Save as scripts/run-e2e-local.ps1 and run from repo root:
#   powershell -ExecutionPolicy Bypass -File .\scripts\run-e2e-local.ps1

$ErrorActionPreference = "Stop"

# 1) Pre-setup
Write-Host "Setting working dir to repo root..."
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Repo root is parent of scripts directory
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
Set-Location $repoRoot

Write-Host "Ensuring artifacts dirs..."
New-Item -ItemType Directory -Force -Path artifacts, test-results, logs | Out-Null

# 2) Node deps
Write-Host "Installing root deps..."
npm ci
Write-Host "Installing frontend deps..."
Push-Location (Join-Path $repoRoot 'frontend')
npm ci
Pop-Location

Write-Host "Installing Playwright Chromium..."
# On Windows, --with-deps is not supported/needed
npx playwright install chromium

# 3) Docker build
Write-Host "Building Docker services..."
$env:GIT_COMMIT = (git rev-parse HEAD)
$env:BUILD_NUMBER = "local-1"
$env:BUILD_TIME = (Get-Date).ToUniversalTime().ToString("s") + "Z"

docker compose -f docker-compose.yml -f docker-compose.e2e.yml build --no-cache `
  --build-arg GIT_COMMIT=$env:GIT_COMMIT `
  --build-arg BUILD_NUMBER=$env:BUILD_NUMBER `
  --build-arg BUILD_TIME=$env:BUILD_TIME

# 4) Docker up
Write-Host "Starting services..."
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d

# 5) Wait for health
Write-Host "Waiting for services to be healthy..."
for ($i = 1; $i -le 60; $i++) {
  $ps = docker compose -f docker-compose.yml -f docker-compose.e2e.yml ps
  if ($ps -match "unhealthy|starting") {
    Write-Host "Services still starting... (attempt $i/60)"
    Start-Sleep -Seconds 10
  } else {
    Write-Host "All services are (likely) healthy!"
    break
  }
  if ($i -eq 60) {
    Write-Host "Services failed to become healthy within 10 minutes"
    docker compose -f docker-compose.yml -f docker-compose.e2e.yml ps
    throw "Health check timeout"
  }
}

# 6) Connectivity checks
Write-Host "Verifying service connectivity..."
curl.exe -f http://localhost:3000/api/health
curl.exe -f http://localhost:8000/health
curl.exe -f -H "X-API-Key: test-secret-e2e" http://localhost:8000/api/auth/readiness
curl.exe -f -H "X-API-Key: test-secret-e2e" http://localhost:8000/api/clubs/health
curl.exe -f -H "X-API-Key: test-secret-e2e" http://localhost:8000/health

Write-Host "Connectivity checks passed."

# 7) Run E2E
Write-Host "Running Playwright tests..."
$env:CI = "true"
$env:API_GATEWAY_SECRET = "test-secret-e2e"
$env:MONGODB_URI = "mongodb://localhost:27017/club_e2e_test"
$env:POSTGRES_URL = "postgresql://postgres:postgres@localhost:5432/auth_e2e_test"
$env:E2E_VERBOSE = "false"

npx playwright test --project=chromium --reporter=line

Write-Host "E2E tests completed."

# 8) Cleanup hint (manual)
Write-Host "Use the following to clean up when done:"
Write-Host 'docker compose -f docker-compose.yml -f docker-compose.e2e.yml down -v'