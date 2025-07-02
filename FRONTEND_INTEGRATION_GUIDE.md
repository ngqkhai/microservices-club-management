# 🚀 Frontend Integration Guide - Club Management System

## 📋 Table of Contents
- [Service Architecture](#service-architecture)
- [Quick Start](#quick-start)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Kong Gateway Usage](#kong-gateway-usage)
- [Error Handling](#error-handling)
- [Testing with Postman/Curl](#testing-with-postmancurl)

---

## 🏗️ Service Architecture

### Kong API Gateway + Microservices
```
Frontend (React/Vue/Angular)
    ↓
Kong API Gateway (Port 8000)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│  Auth Service   │  User Service   │ Notify Service  │
│   (Port 3001)   │  (Port 3002)    │  (Port 3005)    │
└─────────────────┴─────────────────┴─────────────────┘
```

### Key Benefits
- ✅ **Centralized Authentication**: JWT validation at Kong Gateway
- ✅ **Automatic Header Injection**: User context headers (`x-user-id`, `x-user-email`, `x-user-role`)
- ✅ **Rate Limiting**: 100 requests/minute, 1000 requests/hour
- ✅ **CORS Support**: Pre-configured for web applications
- ✅ **Load Balancing & Scaling**: Ready for production

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- Node.js (for local development)

### 1. Clone & Start Services
```bash
# Clone the repository
git clone <repository-url>
cd club-management-system

# Start all services
docker-compose up -d

# Check service health
docker-compose ps
```

### 2. Verify Services
```bash
# Kong Gateway Health (via Auth Service)
curl http://localhost:8000/api/auth/health

# Notification Service Health  
curl http://localhost:8000/api/notifications/health

# Note: http://localhost:8000 (root) will return "no Route matched" - this is expected!
# Kong only routes configured API endpoints, not the root path.
```

### 3. Service URLs
| Service | Direct Access | Via Kong Gateway |
|---------|---------------|------------------|
| Kong Admin API | http://localhost:8001 | - |
| Kong Manager GUI | http://localhost:8002 | - |
| **Frontend Endpoint** | - | **http://localhost:8000** |
| Auth Service | http://localhost:3001 | http://localhost:8000/api/auth/* |
| Notify Service | http://localhost:3005 | http://localhost:8000/api/notifications/* |

> ⚠️ **Important**: Frontend should **ONLY** use `http://localhost:8000` (Kong Gateway)

---

## 🔐 Authentication Flow

### 1. Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe"
  }'
```

### 2. Email Verification
```bash
curl -X POST http://localhost:8000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "verification-token-from-email"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com", 
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJSUzI1NiIs...",
      "refreshToken": "302ffa04d7452da280ea..."
    }
  }
}
```

### 4. Using JWT Token
```bash
# All protected requests need Authorization header
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

---

## 🛣️ API Endpoints

### Authentication Service (Auth)

#### Public Endpoints (No Authentication Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/verify-email` | Email verification |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/public-key` | Get RSA public key |
| `GET` | `/api/auth/health` | Service health check |

#### Protected Endpoints (Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/me` | Get current user profile |
| `POST` | `/api/auth/logout` | Logout user |
| `PUT` | `/api/auth/change-password` | Change user password |

### Notification Service

#### Protected Endpoints (Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | Get user notifications |
| `POST` | `/api/notifications` | Send notification |
| `PUT` | `/api/notifications/:id` | Update notification |
| `DELETE` | `/api/notifications/:id` | Delete notification |

---

## 🔧 Kong Gateway Usage

### Base URL
**All frontend requests should use**: `http://localhost:8000`

> ⚠️ **Important**: Kong only routes specific API paths. The root path (`http://localhost:8000`) will return "no Route matched" - this is normal!

### Configured Routes
Kong Gateway routes these specific paths:
- `/api/auth/*` → Auth Service (Port 3001)
- `/api/notifications/*` → Notify Service (Port 3005)

### Authentication Headers
Kong automatically injects these headers to backend services:
```
x-user-id: aeb7664e-102d-432b-8ddf-2d4014090904
x-user-email: user@example.com  
x-user-role: USER
x-consumer-id: ca8b4057-2bcc-43e6-bb76-7a2a08b79ecd
x-consumer-username: club-management-system
```

### Rate Limiting
- **100 requests per minute**
- **1000 requests per hour**
- Limit applied per consumer/user

### CORS Configuration
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Accept, Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

---

## ❌ Error Handling

### Common HTTP Status Codes
| Code | Meaning | Action |
|------|---------|--------|
| `200` | Success | Continue normally |
| `400` | Bad Request | Check request format |
| `401` | Unauthorized | Token expired/invalid - redirect to login |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `429` | Rate Limited | Wait before retrying |
| `500` | Server Error | Show generic error message |

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": ["Email is required", "Password too short"]
  }
}
```

### JWT Token Expiry
```javascript
// Handle 401 responses
if (response.status === 401) {
  // Token expired - try refresh
  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include' // Include refresh token cookie
  });
  
  if (refreshResponse.ok) {
    // Retry original request with new token
    const { accessToken } = await refreshResponse.json();
    // Retry original request...
  } else {
    // Refresh failed - redirect to login
    window.location.href = '/login';
  }
}
```

---

## 🧪 Testing with Postman/Curl

### Postman Collection Setup

#### 1. Environment Variables
```
BASE_URL: http://localhost:8000
ACCESS_TOKEN: {{will be set automatically}}
```

#### 2. Pre-request Script (For Login)
```javascript
// Auto-save access token from login response
pm.test("Save access token", function () {
    const response = pm.response.json();
    if (response.success && response.data.tokens) {
        pm.environment.set("ACCESS_TOKEN", response.data.tokens.accessToken);
    }
});
```

#### 3. Authorization Header
```
Authorization: Bearer {{ACCESS_TOKEN}}
```

### Complete Curl Examples

#### User Registration Flow
```bash
# 1. Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe"
  }'

# 2. Verify email (check email for token)
curl -X POST http://localhost:8000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "email-verification-token"
  }'

# 3. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'

# 4. Save the accessToken from response for protected requests
```

#### Protected Requests
```bash
# Get user profile
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Change password
curl -X PUT http://localhost:8000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!"
  }'

# Get notifications
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Logout
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Password Reset Flow
```bash
# 1. Request password reset
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'

# 2. Reset password with token from email
curl -X POST http://localhost:8000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "NewSecurePass789!"
  }'
```

#### Token Refresh
```bash
# Refresh access token (refresh token sent as httpOnly cookie)
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Cookie: refreshToken=your-refresh-token"
```

---

## 🔍 Debugging & Monitoring

### Kong Admin API (Development Only)
```bash
# View all services
curl http://localhost:8001/services

# View all routes
curl http://localhost:8001/routes

# View all plugins
curl http://localhost:8001/plugins

# View specific route plugins
curl http://localhost:8001/routes/auth-protected/plugins
```

### Service Health Checks
```bash
# Check all services
curl http://localhost:8000/api/auth/health
curl http://localhost:8000/api/notifications/health

# Check Kong Gateway
curl http://localhost:8001/status
```

### Docker Logs
```bash
# View Kong logs
docker logs club_management_kong

# View Auth service logs  
docker logs club_management_auth

# View all service logs
docker-compose logs -f
```

---

## 🚀 Frontend Integration Checklist

### ✅ API Client Setup
- [ ] Base URL configured to `http://localhost:8000`
- [ ] Authorization header handling implemented
- [ ] Token refresh logic implemented
- [ ] Error handling for 401/403/429 responses
- [ ] CORS credentials enabled for refresh tokens

### ✅ Authentication Flow
- [ ] Registration with email verification
- [ ] Login/logout functionality
- [ ] Password reset flow
- [ ] Protected route guards
- [ ] Token persistence (localStorage/sessionStorage)

### ✅ Error Handling
- [ ] Network error handling
- [ ] Rate limiting awareness
- [ ] User-friendly error messages
- [ ] Loading states

### ✅ Security Best Practices
- [ ] JWT tokens stored securely
- [ ] No sensitive data in localStorage
- [ ] HTTPS in production
- [ ] Input validation on frontend

---

## 🔧 Troubleshooting

### Common Issues

#### ❓ "no Route matched" Error on Root Path
```bash
curl http://localhost:8000
# Returns: {"message":"no Route matched with those values"}
```
**This is expected behavior!** Kong Gateway only routes configured API endpoints:
- ✅ `http://localhost:8000/api/auth/health` 
- ✅ `http://localhost:8000/api/auth/login`
- ✅ `http://localhost:8000/api/notifications`
- ❌ `http://localhost:8000` (root path - not configured)

#### ❓ CORS Errors in Browser
```javascript
// Error: CORS policy blocked
```
**Solution**: Ensure requests go through Kong Gateway (`localhost:8000`), not direct service URLs (`localhost:3001`).

#### ❓ 401 Unauthorized Errors
```json
{"message": "Unauthorized"}
```
**Solutions**:
1. Check if Authorization header is included: `Authorization: Bearer <token>`
2. Verify token hasn't expired
3. Try refreshing the token: `POST /api/auth/refresh`

#### ❓ 429 Rate Limit Exceeded
```json
{"message": "API rate limit exceeded"}
```
**Solution**: Wait before retrying. Limits are 100/minute, 1000/hour.

#### ❓ Service Unavailable (502/503)
**Solutions**:
1. Check if services are running: `docker-compose ps`
2. Check service health: `curl http://localhost:8000/api/auth/health`
3. Restart services: `docker-compose restart`

---

