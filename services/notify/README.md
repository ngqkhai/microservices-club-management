# Notification Service

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)

> **Notification microservice** - Handles email notifications for user verification, password resets, event reminders, and announcements for the Club Management System.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Key Endpoints](#-key-endpoints)
- [Environment Variables](#-environment-variables)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Run with Docker](#-run-with-docker)
- [Email Templates](#-email-templates)
- [Health Checks](#-health-checks)

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express.js 4.x |
| **Message Queue** | RabbitMQ (amqplib) |
| **Email** | Nodemailer |
| **Templates** | Handlebars |
| **Validation** | Joi |
| **Logging** | Winston + Daily Rotate |
| **Security** | Helmet, express-rate-limit |

---

## 🔗 Key Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `GET` | `/health/detailed` | Detailed health (SMTP + RabbitMQ) |
| `GET` | `/ready` | Kubernetes readiness probe |
| `GET` | `/live` | Kubernetes liveness probe |

> **Note:** This service is primarily event-driven. It consumes messages from RabbitMQ queues and sends emails. HTTP endpoints are mainly for health checks.

---

## 🔐 Environment Variables

Create a `.env` file based on `env.example`:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/test/production) | No | `development` |
| `PORT` | Service port | No | `3005` |
| **RabbitMQ** ||||
| `RABBITMQ_URL` | RabbitMQ connection URL | No | `amqp://localhost:5672` |
| `RABBITMQ_EXCHANGE` | Exchange name | No | `club_events` |
| `RABBITMQ_EMAIL_VERIFICATION_QUEUE` | Queue for email verification | No | `send_email_verification` |
| `RABBITMQ_PASSWORD_RESET_QUEUE` | Queue for password reset | No | `send_email_password_reset` |
| `MAX_RETRY_ATTEMPTS` | Max retries for failed messages | No | `3` |
| **SMTP Configuration** ||||
| `SMTP_HOST` | 🔒 SMTP server host | **Yes** | - |
| `SMTP_PORT` | SMTP server port | No | `587` |
| `SMTP_SECURE` | Use TLS (true for 465, false for 587) | No | `false` |
| `SMTP_USER` | 🔒 SMTP username | **Yes** | - |
| `SMTP_PASS` | 🔒 SMTP password/app password | **Yes** | - |
| `SENDER_EMAIL` | From email address | **Yes** | - |
| `SENDER_NAME` | From name | No | `Club Management` |
| **Frontend URLs** ||||
| `FRONTEND_BASE_URL` | Frontend URL for email links | No | `http://localhost:3000` |
| **Security** ||||
| `API_GATEWAY_SECRET` | 🔒 Secret for gateway validation | No | - |
| **Logging** ||||
| `LOG_LEVEL` | Log level (error/warn/info/debug) | No | `info` |

> 🔒 = Sensitive variable - never commit to version control

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App passwords
3. Create a new app password for "Mail"
4. Use this password as `SMTP_PASS`

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SENDER_EMAIL=your-email@gmail.com
```

---

## 📨 Event-Driven Architecture

### Events Consumed (from RabbitMQ)

| Event | Routing Key | Queue | Description |
|-------|-------------|-------|-------------|
| Email Verification | `send.email.verification` | `send_email_verification` | Send verification email to new users |
| Password Reset | `send.email.password.reset` | `send_email_password_reset` | Send password reset link |
| RSVP Confirmation | `send.email.rsvp` | `send_email_rsvp` | Confirm event registration |
| Announcement | `send.email.announcement` | `send_email_announcement` | Club/event announcements |

### Message Payload Example (`send.email.verification`)

```json
{
  "id": "message-uuid",
  "type": "send.email.verification",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "userId": "user-uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "link": "http://localhost:3000/verify-email?token=abc123"
}
```

### Message Processing

1. Message received from queue
2. Validate payload structure
3. Load appropriate email template
4. Render template with data
5. Send email via SMTP
6. ACK message on success
7. Retry with exponential backoff on failure
8. Dead-letter after max retries

---

## 🐳 Run with Docker

### Build the Image

```bash
cd services/notify
docker build -t club-management/notify-service:latest .
```

### Run the Container

```bash
docker run -d \
  --name notify-service \
  -p 3005:3005 \
  -e NODE_ENV=production \
  -e RABBITMQ_URL=amqp://rabbitmq:5672 \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your-email@gmail.com \
  -e SMTP_PASS=your-app-password \
  -e SENDER_EMAIL=your-email@gmail.com \
  -e FRONTEND_BASE_URL=https://your-app.com \
  club-management/notify-service:latest
```

### Docker Compose (Recommended)

```bash
# From project root
docker-compose up notify-service
```

---

## 📧 Email Templates

Templates are stored in `src/templates/` using Handlebars:

```
src/templates/
├── email-verification/
│   ├── index.html        # HTML template
│   ├── index.txt         # Plain text fallback
│   └── meta.json         # Subject line, etc.
└── password-reset/
    ├── index.html
    ├── index.txt
    └── meta.json
```

### Template Variables

| Template | Available Variables |
|----------|---------------------|
| `email-verification` | `fullName`, `verificationLink`, `frontendUrl` |
| `password-reset` | `fullName`, `resetLink`, `expiryTime`, `frontendUrl` |
| `rsvp` | `fullName`, `eventTitle`, `eventDate`, `eventLocation` |
| `announcement` | `title`, `content`, `clubName`, `actionUrl` |

### Adding a New Template

1. Create folder: `src/templates/your-template/`
2. Add `index.html`, `index.txt`, and `meta.json`
3. Update the handler in `src/handlers/notificationHandler.js`

---

## ❤️ Health Checks

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Basic health check |
| `GET /health/detailed` | Detailed status (SMTP + RabbitMQ) |
| `GET /ready` | Kubernetes readiness probe |
| `GET /live` | Kubernetes liveness probe |

### Detailed Health Response

```json
{
  "status": "healthy",
  "service": "notification-service",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "checks": {
    "rabbitmq": {
      "connected": true,
      "queues": ["send_email_verification", "send_email_password_reset"]
    },
    "smtp": {
      "configured": true,
      "host": "smtp.gmail.com",
      "port": 587
    }
  }
}
```

---

## 📁 Project Structure

```
services/notify/
├── src/
│   ├── config/           # Configuration
│   │   ├── email.js      # SMTP configuration
│   │   ├── logger.js     # Winston logger
│   │   └── rabbitmq.js   # RabbitMQ setup
│   ├── handlers/         # Message handlers
│   │   └── notificationHandler.js
│   ├── middlewares/      # Auth middleware
│   ├── routes/           # Health check routes
│   ├── services/         # Business logic
│   │   ├── consumerService.js  # RabbitMQ consumers
│   │   └── emailService.js     # Email sending
│   ├── templates/        # Email templates
│   │   ├── email-verification/
│   │   └── password-reset/
│   ├── app.js            # Express app
│   └── server.js         # Entry point
├── Dockerfile
├── package.json
└── env.example
```

---

## 🔄 Retry Logic

Failed messages are retried with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | 2 seconds |
| 2 | 4 seconds |
| 3 | 8 seconds |
| 4+ | Dead-letter queue |

Messages include `x-retry-count` header to track attempts.

---

## 🧪 Testing Email Locally

For local development without a real SMTP server, use:

1. **Mailhog** (Docker):
   ```bash
   docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
   ```
   Set `SMTP_HOST=localhost` and `SMTP_PORT=1025`. View emails at `http://localhost:8025`.

2. **Ethereal** (Free testing service):
   ```bash
   # Get temporary credentials at https://ethereal.email/
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your-ethereal-user
   SMTP_PASS=your-ethereal-pass
   ```

---

*Last Updated: November 2024*
