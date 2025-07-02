#!/bin/bash

# Kong Configuration Setup Script
# This script fetches the RSA public key from auth service and configures Kong

set -e

# Configuration
KONG_ADMIN_URL="http://kong:8001"
AUTH_SERVICE_URL="http://auth-service:3001"
CONSUMER_NAME="club-management-system"
KEY_ID="auth-service-key-1"

echo "🚀 Starting Kong configuration setup..."

# Wait for Kong to be ready
echo "⏳ Waiting for Kong Admin API to be ready..."
until curl -f -s "${KONG_ADMIN_URL}" > /dev/null 2>&1; do
    echo "   Kong not ready yet, waiting 5 seconds..."
    sleep 5
done
echo "✅ Kong Admin API is ready"

# Wait for Auth Service to be ready
echo "⏳ Waiting for Auth Service to be ready..."
until curl -f -s "${AUTH_SERVICE_URL}/api/auth/health" > /dev/null 2>&1; do
    echo "   Auth Service not ready yet, waiting 5 seconds..."
    sleep 5
done
echo "✅ Auth Service is ready"

# Fetch public key from auth service
echo "🔑 Fetching RSA public key from auth service..."
PUBLIC_KEY=$(curl -s "${AUTH_SERVICE_URL}/api/auth/public-key" | jq -r '.publicKey')

if [ -z "$PUBLIC_KEY" ] || [ "$PUBLIC_KEY" = "null" ]; then
    echo "❌ Failed to fetch public key from auth service"
    exit 1
fi

echo "✅ Successfully fetched public key"

# Check if consumer exists
echo "👤 Checking if consumer exists..."
CONSUMER_EXISTS=$(curl -s "${KONG_ADMIN_URL}/consumers/${CONSUMER_NAME}" | jq -r '.id // empty')

if [ -z "$CONSUMER_EXISTS" ]; then
    echo "📝 Creating consumer: ${CONSUMER_NAME}"
    curl -s -X POST "${KONG_ADMIN_URL}/consumers" \
        -d "username=${CONSUMER_NAME}" > /dev/null
else
    echo "✅ Consumer already exists"
fi

# Check if JWT credential exists
echo "🔐 Checking if JWT credential exists..."
JWT_CRED_EXISTS=$(curl -s "${KONG_ADMIN_URL}/consumers/${CONSUMER_NAME}/jwt" | jq -r ".data[] | select(.key == \"${KEY_ID}\") | .id // empty")

if [ -z "$JWT_CRED_EXISTS" ]; then
    echo "📝 Creating JWT credential..."
    curl -s -X POST "${KONG_ADMIN_URL}/consumers/${CONSUMER_NAME}/jwt" \
        -d "key=${KEY_ID}" \
        -d "algorithm=RS256" \
        --data-urlencode "rsa_public_key=${PUBLIC_KEY}" > /dev/null
    echo "✅ JWT credential created successfully"
else
    echo "🔄 Updating existing JWT credential..."
    curl -s -X PATCH "${KONG_ADMIN_URL}/consumers/${CONSUMER_NAME}/jwt/${JWT_CRED_EXISTS}" \
        --data-urlencode "rsa_public_key=${PUBLIC_KEY}" > /dev/null
    echo "✅ JWT credential updated successfully"
fi

# Create Auth Service
echo "🔧 Creating auth service..."
curl -s -X POST "${KONG_ADMIN_URL}/services" \
    -d "name=auth-service" \
    -d "url=http://auth-service:3001" > /dev/null

# Create Notify Service  
echo "🔧 Creating notify service..."
curl -s -X POST "${KONG_ADMIN_URL}/services" \
    -d "name=notify-service" \
    -d "url=http://notify-service:3005" > /dev/null

echo "✅ Services created successfully"

# Create Auth Routes (Public - No JWT required)
echo "🛣️ Creating public auth routes..."

# Auth health routes
curl -s -X POST "${KONG_ADMIN_URL}/services/auth-service/routes" \
    -d "name=auth-health" \
    -d "paths[]=/api/auth/health" \
    -d "paths[]=/api/auth/liveness" \
    -d "paths[]=/api/auth/readiness" \
    -d "methods[]=GET" \
    -d "strip_path=false" > /dev/null

# Auth public routes  
curl -s -X POST "${KONG_ADMIN_URL}/services/auth-service/routes" \
    -d "name=auth-public" \
    -d "paths[]=/api/auth/register" \
    -d "paths[]=/api/auth/login" \
    -d "paths[]=/api/auth/refresh" \
    -d "paths[]=/api/auth/verify-email" \
    -d "paths[]=/api/auth/forgot-password" \
    -d "paths[]=/api/auth/reset-password" \
    -d "paths[]=/api/auth/public-key" \
    -d "paths[]=/api/auth/.well-known/jwks.json" \
    -d "methods[]=GET" \
    -d "methods[]=POST" \
    -d "strip_path=false" > /dev/null

# Auth protected routes
curl -s -X POST "${KONG_ADMIN_URL}/services/auth-service/routes" \
    -d "name=auth-protected" \
    -d "paths[]=/api/auth/me" \
    -d "paths[]=/api/auth/logout" \
    -d "paths[]=/api/auth/change-password" \
    -d "methods[]=GET" \
    -d "methods[]=POST" \
    -d "methods[]=PUT" \
    -d "methods[]=DELETE" \
    -d "strip_path=false" > /dev/null

# Notify routes
curl -s -X POST "${KONG_ADMIN_URL}/services/notify-service/routes" \
    -d "name=notify-routes" \
    -d "paths[]=/api/notifications" \
    -d "methods[]=GET" \
    -d "methods[]=POST" \
    -d "methods[]=PUT" \
    -d "methods[]=DELETE" \
    -d "strip_path=false" > /dev/null

echo "✅ Routes created successfully"

# Add JWT plugin to protected routes
echo "🔐 Adding JWT authentication to protected routes..."
curl -s -X POST "${KONG_ADMIN_URL}/routes/auth-protected/plugins" \
    -d "name=jwt" \
    -d "config.key_claim_name=kid" \
    -d "config.claims_to_verify[]=exp" \
    -d "config.claims_to_verify[]=aud" \
    -d "config.claims_to_verify[]=iss" > /dev/null

curl -s -X POST "${KONG_ADMIN_URL}/routes/notify-routes/plugins" \
    -d "name=jwt" \
    -d "config.key_claim_name=kid" \
    -d "config.claims_to_verify[]=exp" \
    -d "config.claims_to_verify[]=aud" \
    -d "config.claims_to_verify[]=iss" > /dev/null

# Add JWT claims extraction for protected routes
echo "📨 Adding JWT claims extraction for user information..."

# JWT Claims Extraction Script (sandbox-compatible)
JWT_CLAIMS_SCRIPT="kong.log.info('=== JWT Claims Extractor v2 Starting ==='); local jwt_token = kong.ctx.shared.authenticated_jwt_token; if jwt_token then kong.log.info('Found JWT token in kong.ctx.shared.authenticated_jwt_token'); kong.log.info('JWT token type: ' .. type(jwt_token)); if type(jwt_token) == 'table' then kong.log.info('JWT token is a table, extracting claims...'); local payload = jwt_token.payload or jwt_token; if payload and type(payload) == 'table' then kong.log.info('Payload found, extracting user claims...'); if payload.id then kong.service.request.set_header('x-user-id', tostring(payload.id)); kong.log.info('✅ Set x-user-id: ' .. tostring(payload.id)); end; if payload.email then kong.service.request.set_header('x-user-email', tostring(payload.email)); kong.log.info('✅ Set x-user-email: ' .. tostring(payload.email)); end; if payload.role then kong.service.request.set_header('x-user-role', tostring(payload.role)); kong.log.info('✅ Set x-user-role: ' .. tostring(payload.role)); end; return; end; end; end; local credential = kong.ctx.shared.authenticated_credential; if credential then kong.log.info('Found credential in kong.ctx.shared.authenticated_credential'); kong.log.info('Credential type: ' .. type(credential)); end; local consumer = kong.client.get_consumer(); if consumer then kong.log.info('Found consumer: ' .. (consumer.username or 'unknown')); end; local auth_header = kong.request.get_header('authorization'); if auth_header then kong.log.info('Fallback: Manual JWT parsing without cjson'); local token = auth_header:match('Bearer%s+(.+)'); if token then local parts = {}; for part in token:gmatch('[^.]+') do table.insert(parts, part); end; if #parts == 3 then local payload_encoded = parts[2]; local padding = 4 - (string.len(payload_encoded) % 4); if padding ~= 4 then payload_encoded = payload_encoded .. string.rep('=', padding); end; local payload_json = ngx.decode_base64(payload_encoded); if payload_json then kong.log.info('✅ Decoded JWT payload: ' .. payload_json); local id = payload_json:match('\"id\":\"([^\"]+)\"'); local email = payload_json:match('\"email\":\"([^\"]+)\"'); local role = payload_json:match('\"role\":\"([^\"]+)\"'); if id then kong.service.request.set_header('x-user-id', id); kong.log.info('✅ Set x-user-id: ' .. id); end; if email then kong.service.request.set_header('x-user-email', email); kong.log.info('✅ Set x-user-email: ' .. email); end; if role then kong.service.request.set_header('x-user-role', role); kong.log.info('✅ Set x-user-role: ' .. role); end; return; end; end; end; end; kong.log.err('❌ Failed to extract JWT claims using all methods');"

# Add JWT claims extraction to auth-protected route
curl -s -X POST "${KONG_ADMIN_URL}/routes/auth-protected/plugins" \
    -d "name=post-function" \
    --data-urlencode "config.access[]=${JWT_CLAIMS_SCRIPT}" > /dev/null

# Add JWT claims extraction to notify routes
curl -s -X POST "${KONG_ADMIN_URL}/routes/notify-routes/plugins" \
    -d "name=post-function" \
    --data-urlencode "config.access[]=${JWT_CLAIMS_SCRIPT}" > /dev/null

# Add CORS plugin globally
echo "🌐 Adding CORS support..."
curl -s -X POST "${KONG_ADMIN_URL}/plugins" \
    -d "name=cors" \
    -d "config.origins[]=*" \
    -d "config.methods[]=GET" \
    -d "config.methods[]=POST" \
    -d "config.methods[]=PUT" \
    -d "config.methods[]=DELETE" \
    -d "config.methods[]=OPTIONS" \
    -d "config.headers[]=Accept" \
    -d "config.headers[]=Authorization" \
    -d "config.headers[]=Content-Type" \
    -d "config.credentials=true" \
    -d "config.max_age=3600" > /dev/null

# Add rate limiting
echo "⚡ Adding rate limiting..."
curl -s -X POST "${KONG_ADMIN_URL}/plugins" \
    -d "name=rate-limiting" \
    -d "config.minute=100" \
    -d "config.hour=1000" \
    -d "config.policy=local" > /dev/null

echo "✅ Plugins configured successfully"

echo "🎉 Kong configuration completed successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "   • Kong Admin API: ${KONG_ADMIN_URL}"
echo "   • Kong Proxy: http://localhost:8000"
echo "   • Consumer: ${CONSUMER_NAME}"
echo "   • JWT Key ID: ${KEY_ID}"
echo "   • Algorithm: RS256"
echo "   • Services: auth-service, notify-service"
echo "   • Routes: auth-health, auth-public, auth-protected, notify-routes"
echo ""
echo "🌐 API Gateway is ready to receive requests!"
echo "   Frontend should send requests to: http://localhost:8000" 