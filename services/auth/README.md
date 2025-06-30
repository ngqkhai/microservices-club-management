# Authentication Service

A production-ready Node.js microservice for authentication and user management using Express.js, Sequelize ORM, and PostgreSQL.

## 🚀 Features

- **User Registration & Authentication**
- **JWT Token Management** (delegated to API Gateway)
- **Password Reset Flow** with email notifications
- **Role-Based Access Control** (USER, ADMIN)
- **Account Security** (failed login attempts, account locking)
- **Token Refresh Mechanism** with HTTP-only cookies
- **Event Publishing** via RabbitMQ
- **Comprehensive Logging** with Winston
- **API Documentation** with Swagger/OpenAPI
- **Rate Limiting** with different limits per endpoint
- **Security Headers** and request sanitization
- **Health Checks** and monitoring endpoints
- **Production-Ready** error handling and graceful shutdown

## 🏗️ Architecture

This service is designed to work within a microservices architecture where:
- **API Gateway** handles JWT verification and injects user headers
- **Authentication Service** focuses on user management and token generation
- **Event-driven communication** through RabbitMQ for inter-service coordination

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 12+
- RabbitMQ 3.8+ (optional but recommended)
- SMTP server for email notifications

## ⚡ Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Run database migrations
npm run migrate

# Optional: Seed test data
npm run seed
```

### 3. Start the Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The service will be available at `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | `development` | No |
| `PORT` | Server port | `3001` | No |
| `DB_HOST` | PostgreSQL host | `localhost` | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_NAME` | Database name | `club_management_auth` | Yes |
| `DB_USERNAME` | Database username | `postgres` | Yes |
| `DB_PASSWORD` | Database password | | Yes |
| `JWT_SECRET` | JWT signing secret | | Yes |
| `REFRESH_TOKEN_SECRET` | Refresh token secret | | Yes |
| `EMAIL_USER` | SMTP username | | Yes |
| `EMAIL_PASSWORD` | SMTP password | | Yes |
| `RABBITMQ_URL` | RabbitMQ connection URL | `amqp://localhost:5672` | No |
| `API_GATEWAY_SECRET` | Shared secret with API Gateway | | Yes |

### Database Configuration

The service uses Sequelize ORM with PostgreSQL. Database configuration supports:
- Connection pooling
- SSL connections for production
- Automatic migration management
- Soft deletes with paranoid tables

## 📚 API Documentation

### Interactive Documentation
Visit `http://localhost:3001/api/auth/docs` for Swagger UI documentation.

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

#### Password Management
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change user password

#### User Management
- `GET /api/auth/me` - Get current user information

#### Health & Monitoring
- `GET /api/auth/health` - Service health check
- `GET /api/auth/liveness` - Kubernetes liveness probe
- `GET /api/auth/readiness` - Kubernetes readiness probe

#### Administration
- `POST /api/auth/cleanup` - Cleanup expired tokens (Admin only)

## 🔐 Security Features

### API Gateway Integration
- Trusts `x-user-id` and `x-user-role` headers from API Gateway
- Validates gateway signature via `x-gateway-secret` header
- No JWT verification within this service (delegated to gateway)

### Password Security
- bcrypt hashing with configurable rounds
- Strong password requirements
- Password history prevention
- Account locking after failed attempts

### Token Management
- HTTP-only refresh token cookies
- Token rotation on refresh
- Automatic token cleanup
- Device tracking for tokens

### Rate Limiting
- Different limits per endpoint type
- IP and user-based limiting
- Progressive penalties for violations
- Whitelist support for trusted IPs

### Request Security
- CORS configuration
- Security headers (Helmet.js)
- Request sanitization
- SQL injection prevention
- XSS protection

## 📊 Monitoring & Observability

### Health Checks
```bash
# Basic health check
curl http://localhost:3001/api/auth/health

# Liveness probe
curl http://localhost:3001/api/auth/liveness

# Readiness probe
curl http://localhost:3001/api/auth/readiness
```

### Logging
- Structured JSON logging with Winston
- Log rotation and retention
- Different log levels for environments
- Request/response correlation IDs

### Metrics
- Service uptime tracking
- Database connection monitoring
- RabbitMQ connection status
- Token cleanup statistics

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
- **Unit Tests**: Service logic, utilities, validators
- **Integration Tests**: API endpoints, database operations
- **Mock Services**: Email, RabbitMQ for isolated testing

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 3001:3001 --env-file .env auth-service
```

### Kubernetes
```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -l app=auth-service
```

### Health Checks
Configure health checks in your orchestrator:
- **Liveness**: `GET /api/auth/liveness`
- **Readiness**: `GET /api/auth/readiness`

## 🔄 Event Publishing

The service publishes events to RabbitMQ for:
- User registration
- User login/logout
- Password changes
- Account lockouts

### Event Schema
```json
{
  "id": "user-uuid",
  "type": "user.registered",
  "userId": "user-uuid",
  "email": "user@example.com",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "metadata": {
    "source": "auth-service",
    "version": "1.0.0"
  }
}
```

## 🛠️ Database Management

### Migrations
```bash
# Create new migration
npm run create:migration -- --name add-new-field

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:undo
```

### Seeders
```bash
# Create new seeder
npm run create:seed -- --name demo-users

# Run seeders
npm run seed
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
- Check PostgreSQL is running
- Verify connection credentials
- Ensure database exists
- Check network connectivity

#### RabbitMQ Connection Issues
- Service continues without RabbitMQ
- Check RabbitMQ server status
- Verify connection URL
- Review network policies

#### Email Delivery Problems
- Check SMTP configuration
- Verify email credentials
- Test with email service provider
- Review spam/security settings

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Database query logging
DB_LOGGING=true npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📧 Support

For support and questions:
- Email: support@clubmanagement.com
- Documentation: `/api/auth/docs`
- Issues: GitHub Issues 