# Club Management System

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Kubernetes](https://img.shields.io/badge/kubernetes-ready-blue)

> A **Cloud-Native Ready** microservices platform for managing university clubs, events, memberships, and recruitment campaigns. Built with DevOps best practices including containerization, event-driven architecture, and structured logging.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Services](#-services)
- [Environment Variables](#-environment-variables)
- [Database & Seeding](#-database--seeding)
- [Event-Driven Architecture](#-event-driven-architecture)
- [DevOps & Deployment](#-devops--deployment)
- [Scripts & Commands](#-scripts--commands)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔥 Overview

The Club Management System is a comprehensive microservices-based platform designed for:

- **University Clubs** - Create and manage clubs with member roles
- **Events** - Organize events with RSVP, QR tickets, and check-ins
- **Recruitment** - Run recruitment campaigns with applications
- **Notifications** - Email notifications for verifications, events, etc.

### Key Highlights

✅ **Cloud-Native Ready** - Dockerized services with Kubernetes health probes  
✅ **Event-Driven** - Async communication via RabbitMQ  
✅ **Structured Logging** - Winston-based JSON logging for observability  
✅ **Validated Configuration** - Joi schema validation for all env vars  
✅ **Local Development** - Full local stack with Docker (no cloud needed)  
✅ **Storage Abstraction** - Pluggable storage (MinIO local / Cloudinary production)

---

## 🏗 Architecture

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

## 🛠 Tech Stack

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

## ✨ Features

### User Management
- 📝 Registration with email verification
- 🔐 Login with JWT tokens (access + refresh)
- 🔑 Password reset via email
- 👤 Profile management with profile pictures

### Club Management
- 🏢 Create and manage clubs
- 👥 Member roles: `member`, `organizer`, `club_manager`
- 📊 Club statistics and member counts
- 🖼️ Club logos and cover images

### Recruitment Campaigns
- 📢 Create recruitment campaigns
- 📋 Custom application forms
- ✅ Application review workflow
- 📧 Applicant notifications

### Event Management
- 📅 Create events (in-person, online, hybrid)
- 🎟️ Event registration with QR tickets
- ✅ QR code check-in system
- ⭐ Event favorites
- ⏰ Automatic status updates (cron jobs)

### Notifications
- ✉️ Email verification
- 🔐 Password reset emails
- 📧 Event reminders
- 📢 Club announcements

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required)
- [Node.js 18+](https://nodejs.org/) (for local development)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/club-management-system.git
cd club-management-system
```

### 2. Start Local Infrastructure

**Option A: Using Helper Script (Recommended)**

```powershell
# Windows PowerShell
.\scripts\start-local.ps1 -Start
```

```bash
# Linux/macOS
./scripts/start-local.sh start
```

**Option B: Using Docker Compose Directly**

```bash
# Start databases and infrastructure
docker-compose -f docker-compose.local.yml up -d

# Start all services
docker-compose -f docker-compose.local.yml -f docker-compose.yml up -d
```

### 3. Create Environment File

```bash
# Copy the example env file
cp env.local.example .env
```

### 4. Run Database Migrations & Seeds

```powershell
# Windows
.\scripts\seed-all.ps1
```

```bash
# Linux/macOS
./scripts/seed-all.sh
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **API Gateway** | http://localhost:8000 |
| **Auth API Docs** | http://localhost:3001/api-docs |
| **RabbitMQ Console** | http://localhost:15672 |
| **MinIO Console** | http://localhost:9001 |

### Demo Credentials (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@clubmanagement.com | Password123! | Admin |
| user@clubmanagement.com | Password123! | User |
| manager@clubmanagement.com | Password123! | Club Manager |

---

## 📦 Services

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

## 🔐 Environment Variables

### Root `.env` File

Create from `env.local.example`:

```bash
# Database URLs
AUTH_DATABASE_URL=postgresql://postgres:postgres_local_dev@postgres:5432/auth_service_db
CLUB_MONGODB_URI=mongodb://mongo:mongo_local_dev@mongodb:27017/club_service_db?authSource=admin
EVENT_MONGODB_URI=mongodb://mongo:mongo_local_dev@mongodb:27017/event_service_db?authSource=admin

# RabbitMQ
AUTH_RABBITMQ_URL=amqp://rabbitmq:rabbitmq_local_dev@rabbitmq:5672
NOTIFY_RABBITMQ_URL=amqp://rabbitmq:rabbitmq_local_dev@rabbitmq:5672
IMAGE_RABBITMQ_URL=amqp://rabbitmq:rabbitmq_local_dev@rabbitmq:5672

# Security (change in production!)
API_GATEWAY_SECRET=local-dev-api-gateway-secret-min-16
REFRESH_TOKEN_SECRET=local-dev-refresh-secret-minimum-32-characters-long

# Storage (auto-detects MinIO for local)
STORAGE_PROVIDER=auto
MINIO_ENDPOINT=minio
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_local_dev

# Frontend
FRONTEND_BASE_URL=http://localhost:3000
```

---

## 🗄 Database & Seeding

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

## 📨 Event-Driven Architecture

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

## 🐳 DevOps & Deployment

### Docker Health Checks

All services include Kubernetes-ready health endpoints:

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Full health check (DB, RabbitMQ) |
| `GET /ready` | Readiness probe |
| `GET /live` | Liveness probe |

### Dockerfile Best Practices

- ✅ Multi-stage builds
- ✅ Non-root user (`nodejs`)
- ✅ Health check instructions
- ✅ Production-optimized (`npm ci --only=production`)
- ✅ `.dockerignore` files

### Local Development with Docker

```bash
# Start only infrastructure (databases, RabbitMQ, MinIO)
docker-compose -f docker-compose.local.yml up -d

# Start infrastructure + all services
docker-compose -f docker-compose.local.yml -f docker-compose.yml up -d

# View logs
docker-compose logs -f auth-service

# Rebuild a specific service
docker-compose up -d --build club-service

# Stop everything
docker-compose -f docker-compose.local.yml -f docker-compose.yml down
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

## 📜 Scripts & Commands

### Helper Scripts

| Script | Description |
|--------|-------------|
| `scripts/start-local.ps1` | Windows script to manage local Docker stack |
| `scripts/start-local.sh` | Linux/macOS script to manage local Docker stack |
| `scripts/seed-all.ps1` | Windows script to seed all databases |
| `scripts/seed-all.sh` | Linux/macOS script to seed all databases |

### Common Commands

```bash
# Start local development
.\scripts\start-local.ps1 -Start

# View service logs
.\scripts\start-local.ps1 -Logs auth-service

# Stop all containers
.\scripts\start-local.ps1 -Stop

# Seed databases
.\scripts\seed-all.ps1

# Clear seeded data
.\scripts\seed-all.ps1 -Undo
```

---

## 📚 API Documentation

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

## 📁 Project Structure

```
club-management-system/
├── api-gateway/              # Kong configuration
│   ├── kong.yml              # Declarative config
│   └── plugins/              # Custom plugins
├── database_script/          # Database initialization
│   ├── init-postgres.sql     # PostgreSQL init
│   └── init-mongo.js         # MongoDB init
├── frontend/                 # Next.js frontend
├── scripts/                  # Helper scripts
│   ├── start-local.ps1       # Windows local dev
│   ├── start-local.sh        # Linux local dev
│   ├── seed-all.ps1          # Seed databases
│   └── seed-all.sh
├── services/
│   ├── auth/                 # Auth microservice
│   ├── club/                 # Club microservice
│   ├── event/                # Event microservice
│   ├── image/                # Image microservice
│   └── notify/               # Notification microservice
├── shared/
│   └── events/
│       └── eventTypes.js     # RabbitMQ event constants
├── docker-compose.yml        # Main compose file
├── docker-compose.local.yml  # Local infrastructure
├── env.local.example         # Environment template
└── REFACTORING_ROADMAP.md    # Technical roadmap
```

---

## 🤝 Contributing

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📚 Resources

- [12 Factor App Methodology](https://12factor.net/)
- [Microservices Patterns](https://microservices.io/patterns/)
- [Kong Gateway Docs](https://docs.konghq.com/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

---

**Built with ❤️ for DevOps Learning**

*Last Updated: November 2024*
