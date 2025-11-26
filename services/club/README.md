# Club Service

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

> **Club Management microservice** - Handles club CRUD operations, membership management, recruitment campaigns, and member applications for the Club Management System.

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
| **Database** | MongoDB 6.0+ |
| **ODM** | Mongoose 7.x |
| **Message Queue** | RabbitMQ (amqplib) |
| **Validation** | Joi |
| **Logging** | Winston + Daily Rotate |
| **Migrations** | migrate-mongo |

---

## 🔗 Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/clubs` | List all clubs with filtering/search |
| `GET` | `/api/clubs/:id` | Get club details by ID |
| `POST` | `/api/clubs` | Create a new club (Admin only) |
| `GET` | `/api/clubs/:id/members` | Get club members |
| `POST` | `/api/clubs/:id/members` | Add member to club |
| `PUT` | `/api/clubs/:id/members/:userId/role` | Update member role |
| `GET` | `/api/clubs/:id/recruitments` | Get club recruitment campaigns |
| `POST` | `/api/clubs/:id/campaigns` | Create recruitment campaign |
| `POST` | `/api/campaigns/:id/apply` | Apply to recruitment campaign |
| `GET` | `/api/clubs/health` | Service health check |

### Query Parameters for `/api/clubs`

| Parameter | Description | Example |
|-----------|-------------|---------|
| `search` | Full-text search | `?search=tech` |
| `category` | Filter by category | `?category=Công nghệ` |
| `location` | Filter by location | `?location=Building A` |
| `sort` | Sort order | `?sort=newest` |
| `page` | Page number | `?page=1` |
| `limit` | Items per page | `?limit=10` |

---

## 🔐 Environment Variables

Create a `.env` file based on `env.example`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/test/production) | No | `development` |
| `PORT` | Service port | No | `3002` |
| **Database** ||||
| `MONGODB_URI` | 🔒 MongoDB connection string | **Yes** | - |
| **RabbitMQ** ||||
| `RABBITMQ_URL` | RabbitMQ connection URL | No | `amqp://localhost:5672` |
| `RABBITMQ_EXCHANGE` | Exchange name | No | `club_events` |
| **Service URLs** ||||
| `AUTH_SERVICE_URL` | Auth service base URL | No | `http://auth-service:3001` |
| `EVENT_SERVICE_URL` | Event service base URL | No | `http://event-service:3003` |
| **Security** ||||
| `API_GATEWAY_SECRET` | 🔒 Secret for gateway validation (min 16 chars) | **Yes** | - |
| **Logging** ||||
| `LOG_LEVEL` | Log level (error/warn/info/debug) | No | `info` |

> 🔒 = Sensitive variable - never commit to version control

---

## 📨 Event-Driven Architecture

### Events Published (to RabbitMQ)

| Event | Routing Key | Description | Consumers |
|-------|-------------|-------------|-----------|
| Club Created | `club.created` | When a new club is created | event-service, notify-service |
| Club Updated | `club.updated` | When club details are updated | event-service |
| Club Deleted | `club.deleted` | When a club is deleted | event-service |
| Member Added | `club.member.added` | When member joins a club | notify-service |
| Member Removed | `club.member.removed` | When member leaves/removed | notify-service |
| Campaign Published | `campaign.published` | When recruitment campaign goes live | notify-service |
| Application Submitted | `campaign.application.submitted` | New application received | notify-service |
| Application Approved | `campaign.application.approved` | Application approved | notify-service |

### Events Consumed

| Event | Routing Key | Description | Publisher |
|-------|-------------|-------------|-----------|
| User Created | `user.created` | Cache new user data | auth-service |
| User Updated | `user.updated` | Update cached user data in memberships | auth-service |
| User Deleted | `user.deleted` | Mark memberships as removed | auth-service |
| Image Uploaded | `image.uploaded` | Update club logo/cover image | image-service |

---

## 🐳 Run with Docker

### Build the Image

```bash
cd services/club
docker build -t club-management/club-service:latest .
```

### Run the Container

```bash
docker run -d \
  --name club-service \
  -p 3002:3002 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://user:pass@host:27017/club_db \
  -e API_GATEWAY_SECRET=your-secret-min-16-characters \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  club-management/club-service:latest
```

### Docker Compose (Recommended)

```bash
# From project root
docker-compose up club-service
```

---

## 🗄 Database Migrations

This service uses `migrate-mongo` for MongoDB migrations.

```bash
# Run all pending migrations
npm run migrate:up

# Undo last migration
npm run migrate:down

# Check migration status
npm run migrate:status

# Create new migration
npm run migrate:create -- add-new-index

# Seed demo data
npm run seed

# Undo seeds
npm run seed:undo
```

### Migration Configuration

Migrations are configured in `migrate-mongo-config.js` and stored in `src/migrations/`.

---

## ❤️ Health Checks

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Basic health check |
| `GET /ready` | Kubernetes readiness probe (checks MongoDB) |
| `GET /live` | Kubernetes liveness probe |

### Health Check Response

```json
{
  "status": "ok",
  "service": "club-service",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 📁 Project Structure

```
services/club/
├── src/
│   ├── config/           # Configuration management
│   │   ├── index.js      # Joi-validated config
│   │   ├── database.js   # MongoDB connection + schemas
│   │   └── logger.js     # Winston logger
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Auth, validation, errors
│   ├── migrations/       # migrate-mongo migrations
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── seeders/          # Demo data
│   ├── services/         # Business logic
│   │   ├── clubService.js
│   │   ├── recruitmentCampaignService.js
│   │   ├── imageEventConsumer.js
│   │   └── userEventConsumer.js
│   └── utils/            # Helpers, event publishers
├── migrate-mongo-config.js
├── Dockerfile
├── package.json
└── env.example
```

---

## 📊 Data Models

### Club

```javascript
{
  name: String,           // Unique, max 200 chars
  description: String,    // Max 2000 chars
  category: String,       // Enum: 'Học thuật', 'Nghệ thuật', 'Thể thao', etc.
  location: String,
  contact_email: String,
  logo_url: String,
  cover_url: String,
  manager: {
    user_id: String,      // UUID from auth-service
    full_name: String,
    email: String
  },
  member_count: Number,
  status: String,         // 'ACTIVE' or 'INACTIVE'
  created_by: String,
  created_at: Date,
  updated_at: Date
}
```

### Membership

```javascript
{
  club_id: ObjectId,
  user_id: String,        // UUID from auth-service
  user_email: String,     // Denormalized
  user_full_name: String, // Denormalized
  role: String,           // 'member', 'organizer', 'club_manager'
  status: String,         // 'active', 'pending', 'rejected', 'removed'
  joined_at: Date
}
```

---

*Last Updated: November 2024*

