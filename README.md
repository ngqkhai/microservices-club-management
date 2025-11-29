# Club Management System

> A **Cloud-Native Ready** microservices platform for managing university clubs, events, memberships, and recruitment campaigns. Built with DevOps best practices including containerization, event-driven architecture, and structured logging.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Development Setup](#development-setup)
  - [Production Setup](#production-setup)
- [CI/CD Pipelines](#cicd-pipelines)
- [Services](#services)
- [Environment Variables](#environment-variables)
- [Database & Seeding](#database--seeding)
- [Event-Driven Architecture](#event-driven-architecture)
- [Scripts Reference](#scripts-reference)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The Club Management System is a comprehensive microservices-based platform designed for:

- **University Clubs** - Create and manage clubs with member roles
- **Events** - Organize events with RSVP, QR tickets, and check-ins
- **Recruitment** - Run recruitment campaigns with applications
- **Notifications** - Email notifications for verifications, events, etc.

### Key Highlights

- **Cloud-Native Ready** - Dockerized services with Kubernetes health probes  
- **Event-Driven** - Async communication via RabbitMQ  
- **Structured Logging** - Winston-based JSON logging for observability  
- **Validated Configuration** - Joi schema validation for all env vars  
- **Local Development** - Full local stack with Docker (no cloud needed)  
- **Storage Abstraction** - Pluggable storage (MinIO local / S3 production)

---

## Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        FE[Frontend<br/>Next.js :3000]
    end

    subgraph "API Gateway"
        KONG[Kong Gateway<br/>:8000]
    end

    subgraph "Microservices"
        AUTH[Auth Service<br/>:3001]
        CLUB[Club Service<br/>:3002]
        EVENT[Event Service<br/>:3003]
        IMAGE[Image Service<br/>:3004]
        NOTIFY[Notify Service<br/>:3005]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Auth DB)]
        MONGO[(MongoDB<br/>Club & Event DB)]
        RABBIT[RabbitMQ<br/>Message Queue]
        MINIO[MinIO/S3<br/>Object Storage]
    end

    FE --> KONG
    KONG --> AUTH
    KONG --> CLUB
    KONG --> EVENT
    KONG --> IMAGE

    AUTH --> PG
    AUTH --> RABBIT
    CLUB --> MONGO
    CLUB --> RABBIT
    EVENT --> MONGO
    EVENT --> RABBIT
    IMAGE --> MINIO
    IMAGE --> RABBIT
    NOTIFY --> RABBIT

    classDef service fill:#4CAF50,stroke:#333,stroke-width:2px,color:#fff
    classDef db fill:#2196F3,stroke:#333,stroke-width:2px,color:#fff
    classDef gateway fill:#FF9800,stroke:#333,stroke-width:2px,color:#fff
    
    class AUTH,CLUB,EVENT,IMAGE,NOTIFY service
    class PG,MONGO,RABBIT,MINIO db
    class KONG gateway
```

### Service Communication

| Type | Protocol | Use Case |
|------|----------|----------|
| **Synchronous** | HTTP/REST via Kong | Client → API requests |
| **Asynchronous** | RabbitMQ (AMQP) | Service → Service events |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, Radix UI |
| **Backend** | Node.js 18+, Express.js |
| **API Gateway** | Kong (DB-less mode) |
| **Auth Database** | PostgreSQL 16 + Sequelize ORM |
| **Document Database** | MongoDB 7.0 + Mongoose ODM |
| **Message Queue** | RabbitMQ 3.12 |
| **Object Storage** | MinIO (local) / Cloudinary (production) |
| **Authentication** | JWT (RS256 asymmetric), HTTP-only cookies |
| **Validation** | Joi (config & request validation) |
| **Logging** | Winston + Daily Rotate File |
| **Containerization** | Docker, Docker Compose |
| **Email** | Nodemailer + Handlebars templates |

---

## Features

### User Management
- Registration with email verification
- Login with JWT tokens (access + refresh)
- Password reset via email
- Profile management with profile pictures

### Club Management
- Create and manage clubs
- Member roles: `member`, `organizer`, `club_manager`
- Club statistics and member counts
- Club logos and cover images

### Recruitment Campaigns
- Create recruitment campaigns
- Custom application forms
- Application review workflow
- Applicant notifications

### Event Management
- Create events (in-person, online, hybrid)
- Event registration with QR tickets
- QR code check-in system
- Event favorites
- Automatic status updates (cron jobs)

### Notifications
- Email verification
- Password reset emails
- Event reminders
- Club announcements

---

## Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required)
- [Node.js 18+](https://nodejs.org/) (for local development without Docker)
- [Git](https://git-scm.com/)
- [OpenSSL](https://www.openssl.org/) (for generating JWT keys - included with Git for Windows)

### Development Setup

Follow these steps to set up the project for local development.

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/club-management-system.git
cd club-management-system
```

#### Step 2: Generate JWT Keys

Generate RSA key pairs for JWT authentication:

```powershell
# Windows PowerShell
.\scripts\generate-jwt-keys.ps1
```

```bash
# Linux/macOS
chmod +x ./scripts/generate-jwt-keys.sh
./scripts/generate-jwt-keys.sh
```

This creates:
- `secrets/development/jwt_private.pem` - Private key for signing tokens
- `secrets/development/jwt_public.pem` - Public key for verifying tokens
- `secrets/development/api_gateway_secret.txt` - Kong API gateway secret
- `secrets/development/refresh_token_secret.txt` - Refresh token secret

#### Step 3: Create Environment File

```bash
cp env.local.example .env
```

The default values in `.env` are pre-configured for local Docker development.

#### Step 4: Start Infrastructure (Databases)

```bash
docker-compose -f docker-compose.local.yml up -d
```

This starts:
- PostgreSQL (port 5432) - Auth service database
- MongoDB (port 27017) - Club & Event databases
- RabbitMQ (ports 5672, 15672) - Message queue
- MinIO (ports 9000, 9001) - Local S3-compatible storage

#### Step 5: Start All Services

```bash
docker-compose -f docker-compose.local.yml -f docker-compose.yml up -d
```

Or use the helper script:

```powershell
# Windows
.\scripts\start-local.ps1 -Start
```

```bash
# Linux/macOS
./scripts/start-local.sh start
```

#### Step 6: Run Database Migrations & Seeds

```powershell
# Windows
.\scripts\seed-all.ps1
```

```bash
# Linux/macOS
./scripts/seed-all.sh
```

#### Step 7: Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8000 |
| Auth API Docs | http://localhost:3001/api-docs |
| RabbitMQ Console | http://localhost:15672 |
| MinIO Console | http://localhost:9001 |

#### Demo Credentials (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@clubmanagement.com | Password123! | Admin |
| user@clubmanagement.com | Password123! | User |
| manager@clubmanagement.com | Password123! | Club Manager |

---

### Production Setup

Follow these steps to deploy the system to production.

#### Step 1: Generate Production JWT Keys

```powershell
# Windows PowerShell
.\scripts\generate-jwt-keys.ps1
```

This generates keys in `secrets/production/`. **Keep these secure!**

#### Step 2: Create Production Environment File

```bash
cp env.prod.example .env.production
```

Edit `.env.production` with your production values:

```bash
# Database connections (use managed services)
DATABASE_URL=postgresql://user:password@your-postgres-host:5432/auth_db?sslmode=require
MONGODB_URI=mongodb+srv://user:password@your-mongodb-cluster/club_db
RABBITMQ_URL=amqps://user:password@your-rabbitmq-host/vhost

# Secrets (generate unique values!)
API_GATEWAY_SECRET=<run: openssl rand -base64 32>
REFRESH_TOKEN_SECRET=<run: openssl rand -base64 48>

# JWT Public Key for Kong (copy from secrets/production/jwt_public.pem)
JWT_RSA_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# S3 Storage
AWS_REGION=ap-southeast-1
S3_BUCKET=your-bucket-name
STORAGE_PROVIDER=s3
```

#### Step 3: Generate SSL Certificates

For HTTPS, you need SSL certificates. For development/testing:

```powershell
# Windows - Generate self-signed certificate
.\ssl\generate-self-signed.ps1
```

For production, use Let's Encrypt or your certificate provider and place:
- `ssl/certs/fullchain.pem` - Certificate chain
- `ssl/certs/privkey.pem` - Private key

#### Step 4: Deploy to Production

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

#### Production Security Checklist

- [ ] Use managed database services (AWS RDS, MongoDB Atlas, CloudAMQP)
- [ ] Generate unique JWT keys for production
- [ ] Generate unique secrets (API_GATEWAY_SECRET, REFRESH_TOKEN_SECRET)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Set `NODE_ENV=production` in all services
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies for databases

---

## CI/CD Pipelines

This project uses **GitHub Actions** for continuous integration and deployment with a simplified flow: `main → approval → production`.

### Pipeline Overview

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `auth-service.yml` | Push to `services/auth/**` | Test, build, deploy auth service |
| `club-service.yml` | Push to `services/club/**` | Test, build, deploy club service |
| `event-service.yml` | Push to `services/event/**` | Test, build, deploy event service |
| `image-service.yml` | Push to `services/image/**` | Test, build, deploy image service |
| `notify-service.yml` | Push to `services/notify/**` | Test, build, deploy notify service |
| `frontend.yml` | Push to `frontend/**` | Lint, build, deploy frontend |
| `api-gateway.yml` | Push to `api-gateway/**` | Validate Kong config, deploy |
| `infrastructure.yml` | Push to `docker-compose*.yml` | Validate compose files |
| `pr-checks.yml` | Pull requests | Security audit, outdated deps |
| `scheduled.yml` | Weekly cron | Dependency updates, health checks |
| `reusable-docker-build.yml` | Called by services | Shared Docker build with caching |

### Deployment Flow

```
Push to main → Run Tests → Build Docker Image → Wait for Approval → Deploy to Production
```

- **No staging environment** - simplified for rapid iteration
- **Manual approval** required before production deployment
- **GitHub Container Registry (ghcr.io)** for Docker images

### Local Pipeline Testing with `act`

Test pipelines locally before pushing using [act](https://github.com/nektos/act):

```bash
# Install act (Windows - requires Docker)
choco install act-cli

# Test a specific workflow
act push -W .github/workflows/auth-service.yml --container-architecture linux/amd64

# Test with specific event
act push -W .github/workflows/frontend.yml -e .github/test-event.json

# Test PR checks
act pull_request -W .github/workflows/pr-checks.yml
```

**Note:** Some features (GitHub secrets, environment approvals) only work on GitHub.

### Required GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `GHCR_TOKEN` | GitHub Personal Access Token for container registry |
| `PRODUCTION_HOST` | Production server hostname/IP |
| `PRODUCTION_SSH_KEY` | SSH private key for deployment |
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `MONGODB_URI` | MongoDB connection string (Atlas) |
| `RABBITMQ_URL` | RabbitMQ connection string (CloudAMQP) |
| `AWS_ACCESS_KEY_ID` | AWS credentials for S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for S3 |
| `S3_BUCKET` | S3 bucket name for image storage |
| `JWT_SECRET` | JWT signing secret |
| `GMAIL_USER` | Gmail for notifications |
| `GMAIL_APP_PASSWORD` | Gmail app password |

### GitHub Environments

Create a `production` environment in **Settings → Environments** with:
- Required reviewers for approval gate
- Environment secrets for production values

---

## Docker Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.local.yml` | Infrastructure only (databases, RabbitMQ, MinIO) for local development |
| `docker-compose.yml` | Application services (auth, club, event, image, notify, frontend, kong) |
| `docker-compose.prod.yml` | Production-ready configuration with HTTPS and security hardening |

### Usage Patterns

```bash
# Development: Infrastructure only (run services with npm)
docker-compose -f docker-compose.local.yml up -d

# Development: Full stack in Docker
docker-compose -f docker-compose.local.yml -f docker-compose.yml up -d

# Production: Deploy with production config
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

---

## Services

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **auth-service** | 3001 | PostgreSQL | User authentication, JWT tokens, profiles |
| **club-service** | 3002 | MongoDB | Clubs, memberships, recruitment campaigns |
| **event-service** | 3003 | MongoDB | Events, registrations, QR tickets |
| **image-service** | 3004 | MinIO/Cloudinary | Image upload and storage |
| **notify-service** | 3005 | - | Email notifications (RabbitMQ consumer) |
| **kong** | 8000 | - | API Gateway, JWT validation, routing |

### Service READMEs

Each service has detailed documentation:

- [`services/auth/README.md`](services/auth/README.md)
- [`services/club/README.md`](services/club/README.md)
- [`services/event/README.md`](services/event/README.md)
- [`services/image/README.md`](services/image/README.md)
- [`services/notify/README.md`](services/notify/README.md)

---

## Environment Variables

### Root `.env` File

Create from `env.local.example` for development or `env.prod.example` for production:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string for auth service |
| `MONGODB_URI` | MongoDB connection string for club/event services |
| `RABBITMQ_URL` | RabbitMQ connection string |
| `API_GATEWAY_SECRET` | Secret for Kong JWT validation (min 16 chars) |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens (min 32 chars) |
| `FRONTEND_URL` | Frontend URL for CORS and email links |
| `STORAGE_PROVIDER` | `auto`, `minio`, or `s3` |

See `env.local.example` and `env.prod.example` for complete variable lists.

---

## Database & Seeding

### Database Migrations

```bash
# Auth Service (PostgreSQL)
cd services/auth
npm run migrate        # Run migrations
npm run migrate:undo   # Rollback last migration
npm run migrate:status # Check migration status

# Club Service (MongoDB)
cd services/club
npm run migrate:up     # Run migrations
npm run migrate:down   # Rollback
npm run migrate:status # Check status

# Event Service (MongoDB)
cd services/event
npm run migrate:up
npm run migrate:down
```

### Seeding Demo Data

```bash
# Seed all services at once
.\scripts\seed-all.ps1      # Windows
./scripts/seed-all.sh       # Linux/macOS

# Or seed individually
cd services/auth && npm run seed
cd services/club && npm run seed
cd services/event && npm run seed

# Undo seeds
.\scripts\seed-all.ps1 -Undo    # Windows
./scripts/seed-all.sh --undo    # Linux/macOS
```

---

## Event-Driven Architecture

Services communicate asynchronously via RabbitMQ using a topic exchange.

### Event Flow

```
┌─────────────┐     user.created     ┌─────────────┐
│ Auth Service │ ──────────────────► │ Club Service │
└─────────────┘                      └─────────────┘
       │                                    │
       │         user.updated               │
       └──────────────────────────► ┌─────────────┐
                                    │Event Service │
                                    └─────────────┘
```

### Event Types

| Event | Publisher | Consumers |
|-------|-----------|-----------|
| `user.created` | auth-service | club-service, event-service |
| `user.updated` | auth-service | club-service, event-service |
| `user.deleted` | auth-service | club-service, event-service |
| `image.uploaded` | image-service | auth-service, club-service, event-service |
| `send.email.verification` | auth-service | notify-service |
| `send.email.password.reset` | auth-service | notify-service |

See [`shared/events/eventTypes.js`](shared/events/eventTypes.js) for all event constants.

---

## Scripts Reference

### Helper Scripts

| Script | Description |
|--------|-------------|
| `scripts/generate-jwt-keys.ps1` | Generate RSA key pairs for JWT (Windows) |
| `scripts/generate-jwt-keys.sh` | Generate RSA key pairs for JWT (Linux/macOS) |
| `scripts/start-local.ps1` | Manage local Docker stack (Windows) |
| `scripts/start-local.sh` | Manage local Docker stack (Linux/macOS) |
| `scripts/seed-all.ps1` | Seed all databases (Windows) |
| `scripts/seed-all.sh` | Seed all databases (Linux/macOS) |
| `ssl/generate-self-signed.ps1` | Generate self-signed SSL certificate for local HTTPS |

### Common Commands

```bash
# Start local development
.\scripts\start-local.ps1 -Start    # Windows
./scripts/start-local.sh start      # Linux/macOS

# View service logs
docker-compose logs -f auth-service

# Stop all containers
docker-compose -f docker-compose.local.yml -f docker-compose.yml down

# Rebuild a specific service
docker-compose up -d --build club-service

# Seed databases
.\scripts\seed-all.ps1              # Windows
./scripts/seed-all.sh               # Linux/macOS

# Clear seeded data
.\scripts\seed-all.ps1 -Undo        # Windows
./scripts/seed-all.sh --undo        # Linux/macOS
```

### Admin Tools (Optional)

```bash
# Start with admin tools (pgAdmin, Mongo Express)
docker-compose -f docker-compose.local.yml --profile tools up -d
```

| Tool | URL | Credentials |
|------|-----|-------------|
| pgAdmin | http://localhost:5050 | admin@local.dev / admin_local_dev |
| Mongo Express | http://localhost:8081 | admin / admin_local_dev |
| RabbitMQ | http://localhost:15672 | rabbitmq / rabbitmq_local_dev |
| MinIO | http://localhost:9001 | minioadmin / minioadmin_local_dev |

---

## API Documentation

### Postman Collection

Import the complete API collection for testing:

```
postman/Club_Management_System.postman_collection.json
```

Features:
- All endpoints organized by service
- Auto-saved tokens after login
- Test scripts for response validation
- Pre-configured demo accounts

### Swagger UI

| Service | URL |
|---------|-----|
| Auth Service | http://localhost:3001/api-docs |

### Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/clubs` | List all clubs |
| `POST` | `/api/clubs` | Create club (admin) |
| `GET` | `/api/events` | List events |
| `POST` | `/api/events/:id/join` | Register for event |
| `POST` | `/api/images/upload` | Upload image |

---

## Project Structure

```
club-management-system/
├── api-gateway/              # Kong configuration
│   ├── kong.yml              # Declarative config
│   └── lua-plugins/          # Custom plugins
├── database_script/          # Database initialization
│   ├── init-postgres.sql     # PostgreSQL init
│   └── init-mongo.js         # MongoDB init
├── frontend/                 # Next.js frontend
├── scripts/                  # Helper scripts
│   ├── generate-jwt-keys.ps1 # Generate JWT keys (Windows)
│   ├── generate-jwt-keys.sh  # Generate JWT keys (Linux/macOS)
│   ├── start-local.ps1       # Start local dev (Windows)
│   ├── start-local.sh        # Start local dev (Linux/macOS)
│   ├── seed-all.ps1          # Seed databases (Windows)
│   └── seed-all.sh           # Seed databases (Linux/macOS)
├── secrets/                  # JWT keys and secrets (gitignored)
│   ├── development/          # Dev environment keys
│   └── production/           # Prod environment keys
├── services/
│   ├── auth/                 # Auth microservice
│   ├── club/                 # Club microservice
│   ├── event/                # Event microservice
│   ├── image/                # Image microservice
│   └── notify/               # Notification microservice
├── shared/
│   └── events/
│       └── eventTypes.js     # RabbitMQ event constants
├── ssl/                      # SSL certificates
│   ├── certs/                # Certificate files (gitignored)
│   └── generate-self-signed.ps1
├── docker-compose.yml        # Application services
├── docker-compose.local.yml  # Local infrastructure
├── docker-compose.prod.yml   # Production deployment
├── env.local.example         # Development env template
├── env.prod.example          # Production env template
└── README.md
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing folder structure (see `services/auth` as reference)
- Use Winston logger instead of `console.log`
- Validate environment variables with Joi ConfigManager
- Add health check endpoints to new services
- Write JSDoc comments for public functions
- Update service README when adding features

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Resources

- [12 Factor App Methodology](https://12factor.net/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [Kong Gateway Docs](https://docs.konghq.com/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

---

*Last Updated: November 2024*
