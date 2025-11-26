# Auth Service

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

> **Authentication and User Management microservice** - Handles user registration, login, JWT token management, password reset, email verification, and user profile operations for the Club Management System.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Key Endpoints](#-key-endpoints)
- [Environment Variables](#-environment-variables)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Run with Docker](#-run-with-docker)
- [Database Migrations](#-database-migrations)
- [Health Checks](#-health-checks)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.x |
| **Database** | PostgreSQL 14+ |
| **ORM** | Sequelize 6.x |
| **Message Queue** | RabbitMQ (amqplib) |
| **Authentication** | JWT (RS256 asymmetric) |
| **Password Hashing** | bcryptjs |
| **Validation** | Joi |
| **Logging** | Winston + Daily Rotate |
| **API Docs** | Swagger (swagger-jsdoc) |
| **Security** | Helmet, express-rate-limit |

---

## 🔗 Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user and return JWT tokens |
| `POST` | `/api/auth/refresh` | Refresh access token using refresh token |
| `POST` | `/api/auth/verify-email` | Verify user email with token |
| `POST` | `/api/auth/forgot-password` | Request password reset email |
| `POST` | `/api/auth/reset-password` | Reset password with token |
| `GET` | `/api/auth/me` | Get current user profile |
| `PUT` | `/api/auth/profile` | Update user profile |
| `GET` | `/api/auth/users` | List all users (Admin only) |
| `GET` | `/api/auth/health` | Service health check |

**Swagger Documentation:** Available at `/api-docs` when running in development mode.

---

## 🔐 Environment Variables

Create a `.env` file based on `env.example`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/test/production) | No | `development` |
| `PORT` | Service port | No | `3001` |
| **Database** ||||
| `DATABASE_URL` | PostgreSQL connection string | Yes* | - |
| `DB_HOST` | Database host (if not using DATABASE_URL) | Yes* | `localhost` |
| `DB_PORT` | Database port | No | `5432` |
| `DB_NAME` | Database name | Yes* | - |
| `DB_USERNAME` | Database username | Yes* | - |
| `DB_PASSWORD` | 🔒 Database password | Yes* | - |
| `DB_SSL` | Enable SSL for database | No | `false` |
| **JWT & Security** ||||
| `JWT_ALGORITHM` | JWT signing algorithm | No | `RS256` |
| `JWT_EXPIRES_IN` | Access token expiry | No | `15m` |
| `REFRESH_TOKEN_SECRET` | 🔒 Secret for refresh tokens (min 32 chars) | **Yes** | - |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiry | No | `7d` |
| `BCRYPT_ROUNDS` | Password hashing rounds | No | `12` |
| **RabbitMQ** ||||
| `RABBITMQ_URL` | RabbitMQ connection URL | No | `amqp://localhost:5672` |
| `RABBITMQ_EXCHANGE` | Exchange name | No | `club_events` |
| **Frontend** ||||
| `FRONTEND_BASE_URL` | Frontend URL for email links | No | `http://localhost:3000` |
| **Rate Limiting** ||||
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | No | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `100` |
| **Logging** ||||
| `LOG_LEVEL` | Log level (error/warn/info/debug) | No | `info` |

> 🔒 = Sensitive variable - never commit to version control  
> \* = Required if `DATABASE_URL` is not provided

---

## 📨 Event-Driven Architecture

### Events Published (to RabbitMQ)

| Event | Routing Key | Description | Consumers |
|-------|-------------|-------------|-----------|
| User Created | `user.created` | When a user verifies their email | club-service, event-service |
| User Updated | `user.updated` | When user profile is updated | club-service, event-service |
| User Deleted | `user.deleted` | When user account is deleted | club-service, event-service |
| Email Verification | `send.email.verification` | Request to send verification email | notify-service |
| Password Reset | `send.email.password.reset` | Request to send password reset email | notify-service |

### Events Consumed

| Event | Routing Key | Description | Publisher |
|-------|-------------|-------------|-----------|
| Image Uploaded | `image.uploaded` | Update user profile picture | image-service |

---

## 🐳 Run with Docker

### Build the Image

```bash
cd services/auth
docker build -t club-management/auth-service:latest .
```

### Run the Container

```bash
docker run -d \
  --name auth-service \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e REFRESH_TOKEN_SECRET=your-secret-min-32-characters-long \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  -e FRONTEND_BASE_URL=https://your-frontend.com \
  club-management/auth-service:latest
```

### Docker Compose (Recommended)

```bash
# From project root
docker-compose up auth-service
```

---

## 🗄 Database Migrations

```bash
# Run all pending migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Check migration status
npm run migrate:status

# Seed demo data
npm run seed

# Undo seeds
npm run seed:undo
```

---

## ❤️ Health Checks

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Full health check (DB + RabbitMQ status) |
| `GET /api/auth/liveness` | Kubernetes liveness probe |
| `GET /api/auth/readiness` | Kubernetes readiness probe |

### Health Check Response

```json
{
  "service": "auth-service",
  "version": "1.0.0",
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": { "status": "connected" },
  "rabbitmq": { "connected": true }
}
```

---

## 📁 Project Structure

```
services/auth/
├── src/
│   ├── config/           # Configuration management
│   │   ├── index.js      # Joi-validated config
│   │   ├── database.js   # Sequelize connection
│   │   ├── rabbitmq.js   # RabbitMQ setup
│   │   └── logger.js     # Winston logger
│   ├── controllers/      # Request handlers
│   ├── events/           # RabbitMQ publishers
│   ├── middlewares/      # Auth, rate limiting, security
│   ├── migrations/       # Sequelize migrations
│   ├── models/           # Sequelize models
│   ├── routes/           # Express routes
│   ├── seeders/          # Demo data
│   ├── services/         # Business logic
│   └── utils/            # JWT, validation helpers
├── Dockerfile
├── package.json
└── env.example
```

---

## 🔑 JWT Key Generation

The service uses RS256 (asymmetric) JWT signing. Generate keys:

```bash
# Generate private key
openssl genrsa -out src/config/keys/private.pem 2048

# Generate public key
openssl rsa -in src/config/keys/private.pem -pubout -out src/config/keys/public.pem
```

---

*Last Updated: November 2024*
