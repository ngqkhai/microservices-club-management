# Event Service

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

> **Event Management microservice** - Handles event CRUD operations, user registrations, QR ticket generation, check-ins, and event status automation for the Club Management System.

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
| **Framework** | Express.js 5.x |
| **Module System** | ES Modules (`"type": "module"`) |
| **Database** | MongoDB 8.0+ |
| **ODM** | Mongoose 8.x |
| **Message Queue** | RabbitMQ (amqplib) |
| **Validation** | Joi |
| **Logging** | Winston + Daily Rotate |
| **Migrations** | migrate-mongo |
| **QR Codes** | qrcode |
| **Scheduling** | node-cron |

---

## 🔗 Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/events` | List events with filtering/pagination |
| `GET` | `/api/events/:id` | Get event details by ID |
| `POST` | `/api/events` | Create a new event (Club Manager/Organizer) |
| `PUT` | `/api/events/:id` | Update event details |
| `DELETE` | `/api/events/:id` | Delete an event |
| `GET` | `/api/clubs/:id/events` | Get events for a specific club |
| `POST` | `/api/events/:id/join` | Register for an event |
| `DELETE` | `/api/events/:id/leave` | Cancel registration |
| `GET` | `/api/events/:id/ticket` | Get QR ticket for registered event |
| `POST` | `/api/events/:id/check-in` | Check-in attendee (scan QR) |
| `GET` | `/api/events/my` | Get user's registered events |
| `GET` | `/health` | Service health check |

### Query Parameters for `/api/events`

| Parameter | Description | Example |
|-----------|-------------|---------|
| `filter` | Filter type | `?filter=upcoming` |
| `club_id` | Filter by club | `?club_id=60a...` |
| `status` | Event status | `?status=published` |
| `category` | Event category | `?category=Workshop` |
| `search` | Full-text search | `?search=hackathon` |
| `start_from` | Start date filter | `?start_from=2024-01-01` |
| `page` | Page number | `?page=1` |
| `limit` | Items per page | `?limit=10` |

---

## 🔐 Environment Variables

Create a `.env` file based on `env.example`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/test/production) | No | `development` |
| `PORT` | Service port | No | `3003` |
| **Database** ||||
| `MONGODB_URI` | 🔒 MongoDB connection string | **Yes** | - |
| **RabbitMQ** ||||
| `RABBITMQ_URL` | RabbitMQ connection URL | No | `amqp://localhost:5672` |
| `RABBITMQ_EXCHANGE` | Exchange name | No | `club_events` |
| **Service URLs** ||||
| `AUTH_SERVICE_URL` | Auth service base URL | No | `http://auth-service:3001` |
| `CLUB_SERVICE_URL` | Club service base URL | No | `http://club-service:3002` |
| **Security** ||||
| `API_GATEWAY_SECRET` | 🔒 Secret for gateway validation (min 16 chars) | **Yes** | - |
| **Features** ||||
| `ENABLE_CRON_JOBS` | Enable automatic status updates | No | `true` |
| **Logging** ||||
| `LOG_LEVEL` | Log level (error/warn/info/debug) | No | `info` |

> 🔒 = Sensitive variable - never commit to version control

---

## 📨 Event-Driven Architecture

### Events Published (to RabbitMQ)

| Event | Routing Key | Description | Consumers |
|-------|-------------|-------------|-----------|
| Event Created | `event.created` | When a new event is created | notify-service |
| Event Updated | `event.updated` | When event details change | notify-service |
| Event Cancelled | `event.cancelled` | When event is cancelled | notify-service |
| Registration Created | `event.registration.created` | User registers for event | notify-service |
| Registration Cancelled | `event.registration.cancelled` | User cancels registration | notify-service |
| Attendee Checked In | `event.attendee.checked_in` | QR scan check-in | notify-service |

### Events Consumed

| Event | Routing Key | Description | Publisher |
|-------|-------------|-------------|-----------|
| User Created | `user.created` | Log new user (optional caching) | auth-service |
| User Updated | `user.updated` | Update user data in registrations | auth-service |
| User Deleted | `user.deleted` | Cancel registrations for deleted user | auth-service |
| Image Uploaded | `image.uploaded` | Update event cover image | image-service |
| Club Updated | `club.updated` | Update embedded club info | club-service |

---

## 🐳 Run with Docker

### Build the Image

```bash
cd services/event
docker build -t club-management/event-service:latest .
```

### Run the Container

```bash
docker run -d \
  --name event-service \
  -p 3003:3003 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://user:pass@host:27017/event_db \
  -e API_GATEWAY_SECRET=your-secret-min-16-characters \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  club-management/event-service:latest
```

### Docker Compose (Recommended)

```bash
# From project root
docker-compose up event-service
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

---

## ⏰ Cron Jobs

The service includes automatic status updates via cron jobs:

| Job | Schedule | Description |
|-----|----------|-------------|
| Event Status Update | Every hour | Updates events from `upcoming` → `ongoing` → `completed` based on dates |

Disable with `ENABLE_CRON_JOBS=false`.

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
  "service": "event-service",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 📁 Project Structure

```
services/event/
├── src/
│   ├── config/           # Configuration management
│   │   ├── configManager.js  # Joi-validated config (ES Module)
│   │   ├── database.js       # MongoDB connection
│   │   ├── index.js          # Exports
│   │   └── logger.js         # Winston logger
│   ├── controllers/      # Request handlers
│   ├── dtos/             # Data transfer objects
│   ├── middlewares/      # Auth, validation, errors
│   ├── migrations/       # migrate-mongo migrations
│   ├── models/           # Mongoose models
│   ├── repositories/     # Data access layer
│   ├── routes/           # Express routes
│   ├── seeders/          # Demo data
│   ├── services/         # Business logic
│   │   ├── eventService.js
│   │   ├── statusUpdateService.js
│   │   ├── imageEventConsumer.js
│   │   └── userEventConsumer.js
│   └── utils/            # Helpers
│       ├── cronJobManager.js
│       └── qrCodeGenerator.js
├── migrate-mongo-config.js
├── Dockerfile
├── package.json
└── env.example
```

---

## 📊 Data Models

### Event

```javascript
{
  club_id: ObjectId,       // Reference to club
  title: String,
  description: String,
  short_description: String,
  category: String,        // 'Workshop', 'Seminar', 'Competition', etc.
  event_type: String,      // 'in_person', 'online', 'hybrid'
  visibility: String,      // 'public', 'members_only', 'private'
  location: {
    venue_name: String,
    address: String,
    city: String,
    room: String
  },
  online_url: String,
  start_date: Date,
  end_date: Date,
  registration_deadline: Date,
  capacity: Number,
  registration_count: Number,
  ticket_price: Number,
  is_free: Boolean,
  status: String,          // 'draft', 'upcoming', 'ongoing', 'completed', 'cancelled'
  created_by: String,      // UUID from auth-service
  created_at: Date,
  updated_at: Date
}
```

### Registration

```javascript
{
  event_id: ObjectId,
  user_id: String,         // UUID from auth-service
  user_email: String,      // Denormalized
  user_name: String,       // Denormalized
  ticket_id: String,       // UUID for QR code
  status: String,          // 'registered', 'cancelled', 'attended', 'no_show'
  registration_data: {
    answers: [{
      question_id: String,
      question_text: String,
      answer_value: String,
      answer_type: String
    }]
  },
  payment_info: {
    amount: Number,
    status: String
  },
  registered_at: Date
}
```

---

*Last Updated: November 2024*
