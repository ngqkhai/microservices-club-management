# Kong API Gateway for Club Management System

This directory contains the Kong API Gateway configuration for the Club Management System microservices architecture.

## Architecture Overview

The Kong API Gateway serves as the single entry point for all client requests, providing:

- **JWT Authentication**: Centralized JWT token verification using RSA public key
- **Request Routing**: Routes requests to appropriate microservices
- **Header Injection**: Extracts user info from JWT and injects as headers
- **Rate Limiting**: Protects services from abuse
- **CORS**: Cross-origin resource sharing configuration

## Services Architecture

```
Frontend (React)
       ↓
Kong API Gateway (Port 8000)
       ↓
┌─────────────────────────────────────────┐
│                Services                 │
├─────────────────────────────────────────┤
│ • Auth Service      (Port 3001)        │
│ • User Service      (Port 3002)        │
│ • Event Service     (Port 3003)        │
│ • Club Service      (Port 3004)        │
│ • Notify Service    (Port 3005)        │
│ • Finance Service   (Port 3006)        │
│ • Report Service    (Port 3007)        │
└─────────────────────────────────────────┘
```

## Authentication Flow

### Before Kong (Old Flow)
1. Frontend sends JWT token to service
2. Service fetches public key from auth service
3. Service verifies JWT token
4. Service extracts user info from token
5. Service processes request

### With Kong (New Flow)
1. Frontend sends JWT token to Kong Gateway
2. Kong verifies JWT using cached public key
3. Kong extracts user info from JWT payload
4. Kong injects user headers (x-user-id, x-user-email, x-user-role)
5. Kong forwards request to appropriate service
6. Service extracts user info from headers

## Files

- `kong.yml` - Kong declarative configuration
- `scripts/setup-kong.sh` - Setup script to configure Kong with RSA keys
- `README.md` - This documentation

## Configuration Details

### Public Endpoints (No JWT Required)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/verify-email`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/public-key`
- `GET /api/auth/.well-known/jwks.json`
- `GET /api/auth/health`

### Protected Endpoints (JWT Required)
All other endpoints require valid JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Header Injection
Kong injects the following headers for protected routes:
- `x-user-id`: User ID from JWT payload
- `x-user-email`: User email from JWT payload  
- `x-user-role`: User role from JWT payload

### Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per IP

## Setup Instructions

1. **Start the services**:
   ```bash
   docker-compose up -d
   ```

2. **Kong will automatically**:
   - Create Kong database
   - Run migrations
   - Load declarative configuration
   - Run setup script to configure JWT keys

3. **Access points**:
   - Kong Proxy: http://localhost:8000
   - Kong Admin API: http://localhost:8001
   - Kong Manager: http://localhost:8002

## Service Integration

Services now use simplified authentication middleware that extracts user info from Kong-injected headers instead of verifying JWT tokens:

```javascript
const { authMiddleware } = require('../../../shared/middleware/authMiddleware');

// Use in routes
app.use('/protected-route', authMiddleware, controller);
```

## Testing

Test the gateway with curl:

```bash
# Login to get JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token for protected endpoint
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer <jwt-token>"
```

## Monitoring

- Kong Admin API: http://localhost:8001
- Kong Manager GUI: http://localhost:8002
- Service logs: `docker-compose logs <service-name>`

## Troubleshooting

1. **Kong setup fails**: Check that auth service is healthy and generating RSA keys
2. **JWT verification fails**: Ensure setup script ran successfully and public key is configured
3. **Service communication issues**: Check network connectivity between Kong and services
4. **Header injection not working**: Verify request-transformer plugin configuration

## Benefits

- **Centralized Authentication**: No need for each service to verify JWTs
- **Reduced Complexity**: Services only read headers instead of JWT verification
- **Better Performance**: Cached public key, no service-to-service auth calls
- **Security**: Centralized rate limiting and CORS
- **Scalability**: Kong handles load balancing and service discovery
- **Monitoring**: Centralized logging and metrics 