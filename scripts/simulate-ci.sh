#!/bin/bash
# Bash script to simulate GitHub Actions CI locally
# This script replicates the exact steps from the GitHub Actions workflow

set -e  # Exit on any error

echo "🚀 Starting Local CI Simulation..."
echo "This simulates the exact GitHub Actions workflow steps"

# Step 1: Clean environment
echo ""
echo "📋 Step 1: Cleaning environment..."
docker compose -f docker-compose.yml -f docker-compose.e2e.yml down -v 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Step 2: Create directories
echo ""
echo "📋 Step 2: Creating required directories..."
mkdir -p artifacts
mkdir -p test-results
mkdir -p logs

# Step 3: Install dependencies
echo ""
echo "📋 Step 3: Installing dependencies..."
echo "Installing root dependencies..."
npm ci

echo "Installing frontend dependencies..."
cd frontend
npm ci
cd ..

echo "Installing Playwright..."
npx playwright install --with-deps chromium

# Step 4: Build services
echo ""
echo "📋 Step 4: Building Docker services..."
docker compose -f docker-compose.yml -f docker-compose.e2e.yml build --no-cache

# Step 5: Start services
echo ""
echo "📋 Step 5: Starting services..."
docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d

# Step 6: Wait for health
echo ""
echo "📋 Step 6: Waiting for services to be healthy..."
sleep 30

echo "Checking service health..."
for i in {1..60}; do
    if docker compose -f docker-compose.yml -f docker-compose.e2e.yml ps | grep -E "(unhealthy|starting)" > /dev/null; then
        echo "Services still starting... (attempt $i/60)"
        sleep 10
    else
        echo "All services are healthy!"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo "Services failed to become healthy within 10 minutes"
        docker compose -f docker-compose.yml -f docker-compose.e2e.yml ps
        exit 1
    fi
done

# Step 7: Verify connectivity
echo ""
echo "📋 Step 7: Verifying service connectivity..."

echo "Testing frontend health..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

echo "Testing API Gateway health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API Gateway health check passed"
else
    echo "❌ API Gateway health check failed"
    exit 1
fi

echo "Testing Auth service through API Gateway..."
if curl -f -H "X-API-Key: test-secret-e2e" http://localhost:8000/api/auth/readiness > /dev/null 2>&1; then
    echo "✅ Auth service check passed"
else
    echo "❌ Auth service check failed"
    exit 1
fi

echo "Testing Club service through API Gateway..."
if curl -f -H "X-API-Key: test-secret-e2e" http://localhost:8000/api/clubs/health > /dev/null 2>&1; then
    echo "✅ Club service check passed"
else
    echo "❌ Club service check failed"
    exit 1
fi

echo "All service connectivity checks passed!"

# Step 8: Run tests
echo ""
echo "📋 Step 8: Running E2E tests with CI configuration..."
export CI=true
export API_GATEWAY_SECRET=test-secret-e2e
export MONGODB_URI=mongodb://localhost:27017/club_e2e_test
export POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/auth_e2e_test
export E2E_VERBOSE=false

# Run tests and capture exit code
set +e  # Don't exit on test failure, we want to collect logs
npx playwright test --project=chromium --reporter=line
TEST_RESULT=$?
set -e

# Step 9: Collect logs if failed
if [ $TEST_RESULT -ne 0 ]; then
    echo ""
    echo "📋 Step 9: Collecting Docker logs..."
    docker logs club_management_auth > logs/auth.log 2>&1 || true
    docker logs club_management_club > logs/club.log 2>&1 || true
    docker logs club_management_event > logs/event.log 2>&1 || true
    docker logs club_management_frontend > logs/frontend.log 2>&1 || true
    docker logs club_management_kong > logs/kong.log 2>&1 || true
    docker logs club_management_rabbitmq_e2e > logs/rabbitmq.log 2>&1 || true
    docker logs club_management_notify > logs/notify.log 2>&1 || true
    docker logs club_management_postgres_e2e > logs/postgres.log 2>&1 || true
    docker logs club_management_mongo_e2e > logs/mongo.log 2>&1 || true
    
    echo "Docker container stats:"
    docker stats --no-stream || true
    
    echo "Docker container status:"
    docker compose -f docker-compose.yml -f docker-compose.e2e.yml ps || true
fi

# Step 10: Cleanup
echo ""
echo "📋 Step 10: Cleaning up..."
docker compose -f docker-compose.yml -f docker-compose.e2e.yml down -v || true
docker system prune -f || true

# Results
echo ""
echo "🎯 CI Simulation Results:"
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ SUCCESS: All tests passed! CI simulation complete."
    echo "Your code is ready for GitHub Actions CI."
else
    echo "❌ FAILURE: Tests failed. Check logs in the 'logs' directory."
    echo "Fix issues before pushing to GitHub."
    exit 1
fi

echo ""
echo "📊 Artifacts created:"
echo "- test-results/     (Playwright test results)"
echo "- artifacts/        (Test data and setup artifacts)"
if [ $TEST_RESULT -ne 0 ]; then
    echo "- logs/             (Docker container logs for debugging)"
fi

echo ""
echo "🚀 CI Simulation Complete!"
