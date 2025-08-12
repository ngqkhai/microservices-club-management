# PowerShell script to simulate GitHub Actions CI locally
# This script replicates the exact steps from the GitHub Actions workflow

Write-Host "Starting Local CI Simulation..." -ForegroundColor Green
Write-Host "This simulates the exact GitHub Actions workflow steps" -ForegroundColor Yellow

# Step 1: Clean environment
Write-Host "`nStep 1: Cleaning environment..." -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.e2e.yml down -v 2>$null
docker system prune -f 2>$null

# Step 2: Create directories
Write-Host "`nStep 2: Creating required directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null
New-Item -ItemType Directory -Force -Path "test-results" | Out-Null  
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Step 3: Install dependencies
Write-Host "`nStep 3: Installing dependencies..." -ForegroundColor Cyan
Write-Host "Installing root dependencies..."
npm ci

Write-Host "Installing frontend dependencies..."
Set-Location frontend
npm ci
Set-Location ..

Write-Host "Installing Playwright..."
npx playwright install --with-deps chromium

# Step 4: Build services
Write-Host "`nStep 4: Building Docker services..." -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.e2e.yml build --no-cache

# Step 5: Start services
Write-Host "`nStep 5: Starting services..." -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d

# Step 6: Wait for health
Write-Host "`nStep 6: Waiting for services to be healthy..." -ForegroundColor Cyan
Start-Sleep 30

Write-Host "Checking service health..."
for ($i = 1; $i -le 60; $i++) {
    $unhealthy = docker compose -f docker-compose.yml -f docker-compose.e2e.yml ps | Select-String -Pattern "(unhealthy|starting)"
    if ($unhealthy) {
        Write-Host "Services still starting... (attempt $i/60)" -ForegroundColor Yellow
        Start-Sleep 10
    } else {
        Write-Host "All services are healthy!" -ForegroundColor Green
        break
    }
    
    if ($i -eq 60) {
        Write-Host "Services failed to become healthy within 10 minutes" -ForegroundColor Red
        docker compose -f docker-compose.yml -f docker-compose.e2e.yml ps
        exit 1
    }
}

# Step 7: Verify connectivity
Write-Host "`nStep 7: Verifying service connectivity..." -ForegroundColor Cyan

try {
    Write-Host "Testing frontend health..."
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Frontend: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    Write-Host "Testing API Gateway health..."
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API Gateway: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Gateway health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    Write-Host "Testing Auth service through API Gateway..."
    $headers = @{ "X-API-Key" = "test-secret-e2e" }
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/readiness" -Headers $headers -Method GET -TimeoutSec 10
    Write-Host "✅ Auth Service: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth service check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

try {
    Write-Host "Testing Club service through API Gateway..."
    $headers = @{ "X-API-Key" = "test-secret-e2e" }
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/clubs/health" -Headers $headers -Method GET -TimeoutSec 10
    Write-Host "✅ Club Service: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Club service check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "All service connectivity checks passed!" -ForegroundColor Green

# Step 8: Run tests
Write-Host "`nStep 8: Running E2E tests with CI configuration..." -ForegroundColor Cyan
$env:CI = "true"
$env:API_GATEWAY_SECRET = "test-secret-e2e"
$env:MONGODB_URI = "mongodb://localhost:27017/club_e2e_test"
$env:POSTGRES_URL = "postgresql://postgres:postgres@localhost:5432/auth_e2e_test"
$env:E2E_VERBOSE = "false"

$testResult = $LASTEXITCODE
try {
    npx playwright test --project=chromium --reporter=line
    $testResult = $LASTEXITCODE
} catch {
    $testResult = 1
}

# Step 9: Collect logs if failed
if ($testResult -ne 0) {
    Write-Host "`nStep 9: Collecting Docker logs..." -ForegroundColor Red
    docker logs club_management_auth > logs/auth.log 2>&1
    docker logs club_management_club > logs/club.log 2>&1
    docker logs club_management_event > logs/event.log 2>&1
    docker logs club_management_frontend > logs/frontend.log 2>&1
    docker logs club_management_kong > logs/kong.log 2>&1
    docker logs club_management_rabbitmq_e2e > logs/rabbitmq.log 2>&1
    docker logs club_management_notify > logs/notify.log 2>&1
    docker logs club_management_postgres_e2e > logs/postgres.log 2>&1
    docker logs club_management_mongo_e2e > logs/mongo.log 2>&1
    
    Write-Host "Docker container stats:" -ForegroundColor Yellow
    docker stats --no-stream
    
    Write-Host "Docker container status:" -ForegroundColor Yellow
    docker compose -f docker-compose.yml -f docker-compose.e2e.yml ps
}

# Step 10: Cleanup
Write-Host "`nStep 10: Cleaning up..." -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.e2e.yml down -v
docker system prune -f

# Results
Write-Host "`nCI Simulation Results:" -ForegroundColor White
if ($testResult -eq 0) {
    Write-Host "SUCCESS: All tests passed! CI simulation complete." -ForegroundColor Green
    Write-Host "Your code is ready for GitHub Actions CI." -ForegroundColor Green
} else {
    Write-Host "FAILURE: Tests failed. Check logs in the 'logs' directory." -ForegroundColor Red
    Write-Host "Fix issues before pushing to GitHub." -ForegroundColor Red
    exit 1
}

Write-Host "`nArtifacts created:" -ForegroundColor Cyan
Write-Host "- test-results/     (Playwright test results)" -ForegroundColor Gray
Write-Host "- artifacts/        (Test data and setup artifacts)" -ForegroundColor Gray
if ($testResult -ne 0) {
    Write-Host "- logs/             (Docker container logs for debugging)" -ForegroundColor Gray
}

Write-Host "`nCI Simulation Complete!" -ForegroundColor Green
