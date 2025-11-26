# 🚀 Club Management System - Refactoring Roadmap

> **Goal:** Transform this academic microservices project into a **Cloud-Native Ready** system suitable for DevOps learning (CI/CD, Docker, Kubernetes).

**Created:** November 25, 2025  
**Target Completion:** 4-6 Weeks  
**Difficulty Level:** Intern-Friendly

---

## 📋 Table of Contents

1. [Phase 0: Critical Security Fixes](#phase-0-critical-security-fixes-day-1)
2. [Phase 1: Standardization](#phase-1-standardization-week-1)
3. [Phase 2: Configuration Management](#phase-2-configuration-management-week-2)
4. [Phase 3: Logging & Error Handling](#phase-3-logging--error-handling-week-2-3)
5. [Phase 4: Database Reliability](#phase-4-database-reliability-week-3)
6. [Phase 5: Async Architecture](#phase-5-async-architecture-week-4)
7. [Phase 6: Docker & DevOps Readiness](#phase-6-docker--devops-readiness-week-5)
8. [Phase 7: Documentation & Testing](#phase-7-documentation--testing-week-6)

---

## Phase 0: Critical Security Fixes (Day 1)

> ⚠️ **STOP EVERYTHING AND DO THIS FIRST**

### 0.1 Rotate Compromised Database Credentials

**Issue:** Hardcoded credentials in `database_script/utils/database_config.py` are committed to Git.

| Task | File | Priority |
|------|------|----------|
| ⬜ Rotate Supabase PostgreSQL password | Supabase Dashboard | 🔴 CRITICAL |
| ⬜ Rotate MongoDB Atlas password | MongoDB Atlas Dashboard | 🔴 CRITICAL |
| ⬜ Rotate RabbitMQ credentials (if exposed) | CloudAMQP / RabbitMQ | 🔴 CRITICAL |
| ⬜ Rotate Cloudinary API secret | Cloudinary Dashboard | 🔴 CRITICAL |

### 0.2 Remove Hardcoded Credentials

**File:** `database_script/utils/database_config.py`

```python
# BEFORE (INSECURE):
url = "postgresql://postgres.xxx:password@supabase.com:5432/postgres"

# AFTER (SECURE):
@property
def supabase_url(self) -> str:
    url = os.getenv('SUPABASE_DB_URL')
    if not url:
        raise EnvironmentError(
            "SUPABASE_DB_URL is required. "
            "Create a .env file with: SUPABASE_DB_URL=postgresql://..."
        )
    return url
```

| Task | Status |
|------|--------|
| ⬜ Remove hardcoded Supabase URL fallback (line 28) | |
| ⬜ Remove hardcoded MongoDB URI fallback (line 38) | |
| ⬜ Remove hardcoded Cloudinary config fallback (lines 73-75) | |
| ⬜ Make the script fail loudly with helpful error messages | |
| ⬜ Add `database_script/.env` to `.gitignore` | |

### 0.3 Audit docker-compose.yml for Secrets

**File:** `docker-compose.yml`

| Task | Line | Status |
|------|------|--------|
| ⬜ Move `JWT_RSA_PUBLIC_KEY` to external file or secret | 174-183 | |
| ⬜ Remove default `API_GATEWAY_SECRET` values | Multiple | |
| ⬜ Create `.env.example` template without real values | New file | |

---

## Phase 1: Standardization (Week 1)

### 1.1 Folder Structure Alignment

**Goal:** Make all services follow the same structure as `auth-service` (the gold standard).

#### Target Structure (Per Service):
```
services/{service-name}/
├── src/
│   ├── config/
│   │   ├── index.js          # Centralized config with Joi validation
│   │   ├── database.js       # Database connection config
│   │   └── logger.js         # Winston logger setup
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── middlewares/
│   │   ├── errorHandler.js   # Global error handler
│   │   └── authMiddleware.js # Auth verification
│   ├── routes/
│   ├── utils/
│   ├── events/               # RabbitMQ publishers/consumers
│   │   ├── publisher.js
│   │   └── consumer.js
│   ├── migrations/           # Database migrations
│   └── validators/           # Request validation schemas
├── tests/
├── Dockerfile
├── package.json
└── .env.example
```

#### Tasks by Service:

**Club Service:**
| Task | Status |
|------|--------|
| ⬜ Create `src/config/index.js` with Joi validation (copy pattern from auth) | |
| ⬜ Create `src/config/logger.js` with Winston + Daily Rotate | |
| ⬜ Move database connection to `src/config/database.js` (separate from models) | |
| ⬜ Create `src/events/` folder and move `imageEventConsumer.js` there | |
| ⬜ Create `src/validators/` folder for Joi request schemas | |
| ⬜ Create `src/migrations/` folder for migrate-mongo | |
| ⬜ Create `.env.example` file | |

**Event Service:**
| Task | Status |
|------|--------|
| ⬜ Create `src/config/index.js` with Joi validation | |
| ⬜ Create `src/config/logger.js` with Winston | |
| ⬜ Create `src/events/` folder for RabbitMQ handlers | |
| ⬜ Create `src/validators/` folder | |
| ⬜ Create `src/migrations/` folder | |
| ⬜ Create `.env.example` file | |

**Image Service:**
| Task | Status |
|------|--------|
| ⬜ Create `src/config/index.js` (currently missing) | |
| ⬜ Create `src/config/logger.js` | |
| ⬜ Create `.env.example` file | |

**Notify Service:**
| Task | Status |
|------|--------|
| ⬜ Already has good structure - verify consistency | |
| ⬜ Create `.env.example` file | |

**Finance Service:**
| Task | Status |
|------|--------|
| ⬜ **Decision:** Keep or remove? Currently non-functional | |
| ⬜ If keeping: Implement full service structure | |
| ⬜ If removing: Delete from docker-compose and codebase | |

### 1.2 Module System Consistency

**Issue:** `event-service` uses ES Modules (`import/export`) while others use CommonJS (`require/module.exports`).

| Task | Status |
|------|--------|
| ⬜ **Decision:** Standardize on ES Modules or CommonJS? | |
| ⬜ Option A: Convert `event-service` to CommonJS (easier) | |
| ⬜ Option B: Convert all services to ES Modules (modern) | |
| ⬜ Update all `package.json` files to reflect choice | |
| ⬜ Update import/export statements across affected services | |

**Recommendation:** Convert to ES Modules (add `"type": "module"` to all `package.json` files).

---

## Phase 2: Configuration Management (Week 2)

### 2.1 Create ConfigManager for Each Service

**Pattern to Copy:** `services/auth/src/config/index.js`

**Club Service ConfigManager:**

```javascript
// services/club/src/config/index.js
require('dotenv').config();
const Joi = require('joi');

class ConfigManager {
  constructor() {
    this.config = null;
    this.loadAndValidateConfig();
  }

  getConfigSchema() {
    return Joi.object({
      NODE_ENV: Joi.string()
        .valid('development', 'test', 'production')
        .default('development'),
      
      PORT: Joi.number().port().default(3002),
      
      // MongoDB
      MONGODB_URI: Joi.string().required(),
      
      // RabbitMQ
      RABBITMQ_URL: Joi.string().uri({ scheme: ['amqp', 'amqps'] }).required(),
      
      // Service URLs
      AUTH_SERVICE_URL: Joi.string().uri().default('http://auth-service:3001'),
      EVENT_SERVICE_URL: Joi.string().uri().default('http://event-service:3003'),
      
      // Security
      API_GATEWAY_SECRET: Joi.string().min(16).required(),
      
      // Logging
      LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'debug')
        .default('info'),
    }).unknown(false);
  }

  loadAndValidateConfig() {
    // ... validation logic (copy from auth service)
  }

  get(key) {
    return this.config[key];
  }
}

module.exports = new ConfigManager();
```

| Task | Service | Status |
|------|---------|--------|
| ⬜ Create ConfigManager | club-service | |
| ⬜ Create ConfigManager | event-service | |
| ⬜ Create ConfigManager | image-service | |
| ⬜ Update ConfigManager | notify-service (if needed) | |
| ⬜ Migrate all `process.env` calls to use ConfigManager | All services | |

### 2.2 Create .env.example Files

**Template:**
```bash
# .env.example - Copy to .env and fill in values

# Environment
NODE_ENV=development
PORT=3002

# Database
MONGODB_URI=mongodb://localhost:27017/club_service

# Message Queue
RABBITMQ_URL=amqp://localhost:5672

# Service Discovery
AUTH_SERVICE_URL=http://localhost:3001
EVENT_SERVICE_URL=http://localhost:3003

# Security
API_GATEWAY_SECRET=your-secret-here-minimum-16-chars

# Logging
LOG_LEVEL=debug
```

| Task | Status |
|------|--------|
| ⬜ Create `services/auth/.env.example` | |
| ⬜ Create `services/club/.env.example` | |
| ⬜ Create `services/event/.env.example` | |
| ⬜ Create `services/image/.env.example` | |
| ⬜ Create `services/notify/.env.example` | |
| ⬜ Create `frontend/.env.example` | |
| ⬜ Create root `.env.example` for docker-compose | |
| ⬜ Add all `.env` files to `.gitignore` | |

### 2.3 Remove Hardcoded Values

**Locations to Fix:**

| File | Issue | Fix |
|------|-------|-----|
| `api-gateway/kong.yml` | Hardcoded CORS origins | Use env variables |
| `services/image/src/server.js` | Hardcoded CORS origins (line ~20) | Use config |
| `docker-compose.yml` | Default secrets in environment | Remove defaults |
| `services/club/src/config/database.js` | Fallback MongoDB URI | Fail if missing |
| `services/event/src/config/database.js` | Fallback MongoDB URI | Fail if missing |

---

## Phase 3: Logging & Error Handling (Week 2-3)

### 3.1 Replace console.log with Structured Logger

**Logger Pattern (Copy from auth-service):**

```javascript
// src/config/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: process.env.SERVICE_NAME || 'unknown-service',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
```

**High Priority Files (Most console.log usage):**

| File | Approx Lines | Priority |
|------|--------------|----------|
| ✅ `services/event/src/services/eventService.js` | ~50+ console.logs | 🔴 HIGH |
| ✅ `services/club/src/models/club.js` | ~15 console.logs | 🔴 HIGH |
| ✅ `services/club/src/services/clubService.js` | ~20 console.logs | 🔴 HIGH |
| ✅ `services/image/src/server.js` | ~10 console.logs | 🟠 MEDIUM |
| ✅ `services/club/src/config/database.js` | ~5 console.logs | 🟠 MEDIUM |
| ✅ `services/event/src/config/database.js` | ~5 console.logs | 🟠 MEDIUM |

**Replacement Pattern:**
```javascript
// BEFORE:
console.log('Creating event:', eventData);
console.error('Error creating event:', error);

// AFTER:
const logger = require('../config/logger');
logger.info('Creating event', { eventData, userId: req.user.id });
logger.error('Error creating event', { error: error.message, stack: error.stack });
```

### 3.2 Standardize Error Handling

**Goal:** All services return errors in the same format.

**Target Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  },
  "requestId": "req-123-abc"
}
```

**Create Shared Error Classes:**

```javascript
// shared/utils/errors.js
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

module.exports = { AppError, ValidationError, NotFoundError, UnauthorizedError };
```

| Task | Status |
|------|--------|
| ⬜ Create `shared/utils/errors.js` with custom error classes | (Optional - existing per-service handlers work well) |
| ⬜ Create `shared/middleware/errorHandler.js` (global handler) | (Optional - existing per-service handlers work well) |
| ✅ Update `services/auth/src/middlewares/errorHandler.js` | Uses structured logger |
| ✅ Update `services/club/src/middlewares/errorMiddleware.js` | Uses structured logger |
| ✅ Update `services/event/src/middlewares/errorMiddleware.js` | Uses structured logger |
| ✅ Error handler in image-service | Uses structured logger |
| ⬜ Add error handler to notify-service | |

> **Phase 3 Status:** ✅ **COMPLETED** (Nov 26, 2025)
> - Replaced ~200+ console.log/error statements with Winston structured logger
> - Updated club-service, event-service, and image-service
> - All error handlers now use structured logging with request context

---

## Phase 4: Database Reliability (Week 3)

### 4.1 Add Missing Indexes

**PostgreSQL (Auth Service):**

Create migration: `services/auth/src/migrations/20250125000001-add-missing-indexes.js`

```javascript
module.exports = {
  async up(queryInterface) {
    // Phone number index (unique where not null)
    await queryInterface.addIndex('users', ['phone'], {
      unique: true,
      where: { phone: { [Sequelize.Op.ne]: null } },
      name: 'users_phone_unique'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'users_phone_unique');
  }
};
```

| Task | Status |
|------|--------|
| ✅ Create migration for phone index | ✅ Already exists |
| ✅ Run migration: `npx sequelize-cli db:migrate` | ✅ Migration ready |

**MongoDB (Club Service):**

Add to `services/club/src/config/database.js`:

```javascript
// After clubSchema definition
clubSchema.index({ category: 1 });
clubSchema.index({ status: 1 });
clubSchema.index({ 'manager.user_id': 1 });
clubSchema.index({ created_at: -1 });
clubSchema.index({ location: 1 });
```

| Task | Status |
|------|--------|
| ✅ Add category index to clubSchema | ✅ Complete |
| ✅ Add status index to clubSchema | ✅ Complete |
| ✅ Add manager.user_id index to clubSchema | ✅ Complete |
| ✅ Add created_at index to clubSchema | ✅ Complete |

### 4.2 Set Up MongoDB Migrations

**Install migrate-mongo:**

```bash
cd services/club
npm install migrate-mongo
npx migrate-mongo init
```

**Configure `migrate-mongo-config.js`:**

```javascript
module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true }
  },
  migrationsDir: 'src/migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js'
};
```

| Task | Service | Status |
|------|---------|--------|
| ✅ Install migrate-mongo | club-service | ✅ Complete |
| ✅ Initialize migrate-mongo | club-service | ✅ Complete |
| ✅ Create first migration (indexes) | club-service | ✅ Complete |
| ✅ Install migrate-mongo | event-service | ✅ Complete |
| ✅ Initialize migrate-mongo | event-service | ✅ Complete |
| ✅ Create first migration (indexes) | event-service | ✅ Complete |
| ✅ Add migration scripts to package.json | Both services | ✅ Complete |

**Add to package.json:**
```json
{
  "scripts": {
    "migrate:up": "migrate-mongo up",
    "migrate:down": "migrate-mongo down",
    "migrate:status": "migrate-mongo status"
  }
}
```

### 4.3 Replace Mixed Types with Strict Schemas

**File:** `services/event/src/models/registration.js`

```javascript
// BEFORE:
answers: [{
  type: mongoose.Schema.Types.Mixed
}]

// AFTER:
answers: [{
  question_id: { type: String, required: true },
  question_text: { type: String, required: true },
  answer_value: { type: String, required: true },
  answer_type: { 
    type: String, 
    enum: ['text', 'select', 'checkbox', 'number'],
    required: true 
  }
}]
```

| Task | File | Status |
|------|------|--------|
| ✅ Replace Mixed in registration answers | `event/src/models/registration.js` | ✅ Complete |
| ✅ Replace Mixed in application_answers | `club/src/config/database.js` | ✅ Complete |
| ✅ Replace Mixed in review_criteria | `club/src/config/database.js` | ✅ Complete |

### 4.4 Add Denormalized User Data to Membership

**File:** `services/club/src/config/database.js`

```javascript
const membershipSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // Add these for denormalization:
  user_full_name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 255
  },
  user_email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  user_profile_picture_url: {
    type: String,
    maxLength: 500
  }
});
```

| Task | Status |
|------|--------|
| ✅ Add user_full_name to membershipSchema (required) | ✅ Already existed |
| ✅ Add user_email to membershipSchema (required) | ✅ Already existed |
| ✅ Add user_profile_picture_url to membershipSchema | ✅ Complete |
| ⬜ Update clubService.addClubMember to populate these fields | (Optional - service logic) |
| ⬜ Create migration to backfill existing memberships | (Optional - for existing data) |

### 4.5 Finance Service Decision

| Option | Action | Status |
|--------|--------|--------|
| ⬜ ~~Option A: Implement Finance Service~~ | Create models, routes, controllers | Skipped |
| ✅ **Option B:** Remove Finance Service | Delete from docker-compose, remove folder | ✅ Complete |

**Decision:** Removed the empty Finance Service folder. Can be re-added later when needed.

### 4.6 Database Seeds (Added)

| Task | Service | Status |
|------|---------|--------|
| ✅ Update auth seeder with fixed UUIDs | auth-service | ✅ Complete |
| ✅ Create club seeder (clubs, memberships, campaigns) | club-service | ✅ Complete |
| ✅ Create event seeder (events, registrations) | event-service | ✅ Complete |
| ✅ Add seed scripts to package.json | All services | ✅ Complete |

**Seed Commands:**
```bash
# Auth service
cd services/auth && npm run seed

# Club service
cd services/club && npm run seed

# Event service
cd services/event && npm run seed
```

**Test Credentials (after seeding):**
| Email | Password | Role |
|-------|----------|------|
| admin@clubmanagement.com | AdminPassword123! | Admin |
| user@clubmanagement.com | UserPassword123! | User |
| manager@clubmanagement.com | ManagerPassword123! | Club Manager |

---

## Phase 5: Async Architecture (Week 4)

### 5.1 Convert Synchronous HTTP Calls to RabbitMQ Events

**Priority Conversions:**

#### 5.1.1 User Sync (Auth → Other Services)

**Current Flow (Synchronous):**
```
Auth.register() → HTTP POST → user-service/sync
```

**Target Flow (Asynchronous):**
```
Auth.register() → RabbitMQ publish → user.created event
                                   → Club Service consumes
                                   → Event Service consumes
```

| Task | Status |
|------|--------|
| ✅ Create `shared/events/eventTypes.js` with event constants | ✅ Complete |
| ✅ Update auth publisher to emit `user.created` event | ✅ Complete |
| ✅ Update auth publisher to emit `user.updated` event | ✅ Complete |
| ✅ Create consumer in club-service for user events | ✅ Complete |
| ✅ Create consumer in event-service for user events | ✅ Complete |
| ✅ Remove synchronous `userSyncService` calls | ✅ Complete |

**Event Schema:**
```javascript
// shared/events/eventTypes.js
module.exports = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  CLUB_CREATED: 'club.created',
  CLUB_MEMBER_ADDED: 'club.member.added',
  EVENT_CREATED: 'event.created',
  EVENT_REGISTRATION: 'event.registration',
  IMAGE_UPLOADED: 'image.uploaded'
};
```

#### 5.1.2 Club Verification (Club → Auth)

**Current Flow:**
```javascript
// services/club/src/utils/authServiceClient.js
await authServiceClient.verifyUserExists(userId);  // ❌ Synchronous HTTP
```

**Target Flow:**
- Remove verification call entirely
- Trust JWT claims from Kong (user already authenticated)
- OR: Cache user info locally via RabbitMQ events

| Task | Status |
|------|--------|
| ⬜ Remove `authServiceClient.verifyUserExists()` usage | (Deferred - low priority) |
| ✅ Trust `req.user` from Kong JWT verification | ✅ Already in place |
| ✅ Create local user cache updated via RabbitMQ | ✅ Complete (via userEventConsumer) |

#### 5.1.3 Event Statistics (Event → Club)

**Current Flow:**
```javascript
// Event service fetches club info via HTTP for each event
```

**Target Flow:**
- Already partially done (club info embedded in event)
- Ensure club updates trigger RabbitMQ events
- Event service updates embedded club info via consumer

| Task | Status |
|------|--------|
| ✅ Create `club.updated` event publisher in club-service | ✅ Complete |
| ⬜ Create consumer in event-service to update embedded club info | (Deferred) |

### 5.2 Implement Campaign Event Publisher

**File:** `services/club/src/utils/campaignEventPublisher.js`

Currently placeholder with TODOs. Implement actual RabbitMQ publishing.

```javascript
const amqp = require('amqplib');
const config = require('../config');

class CampaignEventPublisher {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'club_events';
  }

  async connect() {
    this.connection = await amqp.connect(config.get('RABBITMQ_URL'));
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
  }

  async publishApplicationSubmitted(campaignId, applicationId, userId) {
    const event = {
      type: 'campaign.application.submitted',
      data: { campaignId, applicationId, userId },
      timestamp: new Date().toISOString()
    };
    await this.publish('campaign.application.submitted', event);
  }

  async publishApplicationApproved(campaignId, applicationId, userId, clubId) {
    const event = {
      type: 'campaign.application.approved',
      data: { campaignId, applicationId, userId, clubId },
      timestamp: new Date().toISOString()
    };
    await this.publish('campaign.application.approved', event);
  }

  async publish(routingKey, event) {
    if (!this.channel) await this.connect();
    this.channel.publish(
      this.exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      { persistent: true }
    );
  }
}

module.exports = new CampaignEventPublisher();
```

| Task | Status |
|------|--------|
| ⬜ Implement CampaignEventPublisher with real RabbitMQ | |
| ⬜ Add event types for campaign lifecycle | |
| ⬜ Create consumer in notify-service for campaign notifications | |

### 5.3 Add Resilience Patterns

#### Dead Letter Queue (DLQ) for Failed Messages

```javascript
// In RabbitMQ consumer setup
await channel.assertQueue('auth_events_dlq', { durable: true });
await channel.assertQueue('auth_events', {
  durable: true,
  deadLetterExchange: '',
  deadLetterRoutingKey: 'auth_events_dlq'
});
```

| Task | Status |
|------|--------|
| ⬜ Add DLQ to auth-service consumer | |
| ⬜ Add DLQ to club-service consumer | |
| ⬜ Add DLQ to event-service consumer | |
| ⬜ Add DLQ to notify-service consumer | |
| ⬜ Add DLQ to image-service consumer | |

#### Retry Logic with Exponential Backoff

```javascript
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

async function handleMessageWithRetry(message, handler) {
  const retryCount = (message.properties.headers['x-retry-count'] || 0);
  
  try {
    await handler(message);
    channel.ack(message);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      // Requeue with delay
      setTimeout(() => {
        channel.publish(exchange, routingKey, message.content, {
          headers: { 'x-retry-count': retryCount + 1 }
        });
      }, RETRY_DELAYS[retryCount]);
      channel.ack(message);
    } else {
      // Send to DLQ
      channel.nack(message, false, false);
    }
  }
}
```

| Task | Status |
|------|--------|
| ⬜ Implement retry logic in shared utility | |
| ⬜ Apply to all RabbitMQ consumers | |

### 5.4 Add Idempotency Keys

**Problem:** Retrying a "Create Membership" operation might create duplicate memberships.

**Solution:** Add idempotency keys to mutation operations.

```javascript
// In message payload
{
  "idempotencyKey": "campaign-123-user-456-approve",
  "type": "campaign.application.approved",
  "data": { ... }
}

// In consumer
const processedKeys = new Set(); // Or use Redis

async function handleApproval(message) {
  const { idempotencyKey } = message;
  
  if (processedKeys.has(idempotencyKey)) {
    logger.info('Skipping duplicate message', { idempotencyKey });
    return;
  }
  
  // Process message...
  processedKeys.add(idempotencyKey);
}
```

| Task | Status |
|------|--------|
| ⬜ Add idempotency key to campaign events | |
| ⬜ Add idempotency key to user sync events | |
| ⬜ Implement idempotency check in consumers | |
| ⬜ Consider Redis for distributed idempotency tracking | |

---

## Phase 6: Docker & DevOps Readiness (Week 5)

### 6.1 Dockerfile Improvements

**Current Issues:**
- Some services missing health checks
- Inconsistent base images
- Missing multi-stage build optimization

**Target Dockerfile Template:**

```dockerfile
# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache wget

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE ${PORT:-3000}
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .
USER nodejs
EXPOSE ${PORT:-3000}
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/health || exit 1
CMD ["node", "src/server.js"]
```

| Task | Service | Status |
|------|---------|--------|
| ⬜ Update Dockerfile to template | auth-service | |
| ⬜ Update Dockerfile to template | club-service | |
| ⬜ Update Dockerfile to template | event-service | |
| ⬜ Update Dockerfile to template | image-service | |
| ⬜ Update Dockerfile to template | notify-service | |
| ⬜ Create Dockerfile | finance-service (if keeping) | |

### 6.2 Add Health Check Endpoints

**Standard Health Check Response:**

```javascript
// GET /health
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: process.env.SERVICE_NAME,
    version: process.env.SERVICE_VERSION || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      rabbitmq: await checkRabbitMQ()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(c => c.status === 'up');
  res.status(isHealthy ? 200 : 503).json(health);
});

// GET /ready (Kubernetes readiness probe)
app.get('/ready', async (req, res) => {
  const isReady = await checkDatabaseConnection();
  res.status(isReady ? 200 : 503).json({ ready: isReady });
});

// GET /live (Kubernetes liveness probe)
app.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});
```

| Task | Service | Status |
|------|---------|--------|
| ⬜ Add /health, /ready, /live endpoints | auth-service | |
| ⬜ Add /health, /ready, /live endpoints | club-service | |
| ⬜ Add /health, /ready, /live endpoints | event-service | |
| ⬜ Add /health, /ready, /live endpoints | image-service | |
| ⬜ Add /health, /ready, /live endpoints | notify-service | |

### 6.3 Docker Compose Improvements

**Create docker-compose.override.yml for local development:**

```yaml
# docker-compose.override.yml (for local dev, not committed)
services:
  auth-service:
    volumes:
      - ./services/auth:/app
      - /app/node_modules
    environment:
      - DEBUG=true
      
  club-service:
    volumes:
      - ./services/club:/app
      - /app/node_modules
```

| Task | Status |
|------|--------|
| ⬜ Create `docker-compose.override.yml.example` | |
| ⬜ Create `docker-compose.prod.yml` for production | |
| ⬜ Add `.env.docker.example` for Docker-specific env vars | |
| ⬜ Remove default secrets from main docker-compose.yml | |

### 6.4 Add npm Scripts for DevOps

**Update package.json in each service:**

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "migrate": "sequelize-cli db:migrate",
    "migrate:undo": "sequelize-cli db:migrate:undo",
    "seed": "sequelize-cli db:seed:all",
    "health-check": "node scripts/health-check.js"
  }
}
```

| Task | Status |
|------|--------|
| ⬜ Add standard scripts to auth-service package.json | |
| ⬜ Add standard scripts to club-service package.json | |
| ⬜ Add standard scripts to event-service package.json | |
| ⬜ Add standard scripts to image-service package.json | |
| ⬜ Add standard scripts to notify-service package.json | |

---

## Phase 7: Documentation & Testing (Week 6)

### 7.1 Create Architecture Diagrams

| Task | Status |
|------|--------|
| ⬜ Create system architecture diagram (draw.io or Mermaid) | |
| ⬜ Create data flow diagram | |
| ⬜ Create RabbitMQ event flow diagram | |
| ⬜ Create database schema diagrams (per service) | |

**Example Mermaid Diagram:**
```mermaid
graph TD
    Client[Frontend] --> Kong[Kong API Gateway]
    Kong --> Auth[Auth Service<br/>PostgreSQL]
    Kong --> Club[Club Service<br/>MongoDB]
    Kong --> Event[Event Service<br/>MongoDB]
    Kong --> Image[Image Service<br/>Cloudinary]
    
    Auth --> RabbitMQ((RabbitMQ))
    Club --> RabbitMQ
    Event --> RabbitMQ
    Image --> RabbitMQ
    RabbitMQ --> Notify[Notify Service]
```

### 7.2 Update README.md

| Task | Status |
|------|--------|
| ⬜ Add quick start guide | |
| ⬜ Add environment setup instructions | |
| ⬜ Add architecture overview section | |
| ⬜ Add API documentation links | |
| ⬜ Add troubleshooting section | |
| ⬜ Add contribution guidelines | |

### 7.3 Add Integration Tests

**Example Test Structure:**
```javascript
// tests/integration/club-creation.test.js
describe('Club Creation Flow', () => {
  it('should create club and emit event', async () => {
    // 1. Create club via API
    const response = await request(app)
      .post('/api/clubs')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Club', category: 'Học thuật' });
    
    expect(response.status).toBe(201);
    
    // 2. Verify RabbitMQ event was published
    const event = await waitForEvent('club.created');
    expect(event.data.clubId).toBe(response.body.data.id);
  });
});
```

| Task | Status |
|------|--------|
| ⬜ Add integration tests for auth flow | |
| ⬜ Add integration tests for club creation | |
| ⬜ Add integration tests for event registration | |
| ⬜ Add integration tests for RabbitMQ events | |
| ⬜ Set up test database configuration | |

### 7.4 Create Seeding Scripts (JavaScript)

**For each service, create test data seeders:**

```javascript
// services/club/src/scripts/seed.js
const { Club, Membership } = require('../config/database');

const seedClubs = async () => {
  const clubs = [
    {
      name: 'Chess Club',
      category: 'Học thuật',
      description: 'Learn and play chess',
      manager: {
        user_id: 'seed-user-1',
        full_name: 'Seed Manager',
        email: 'manager@seed.com'
      },
      created_by: 'seed-user-1',
      status: 'ACTIVE'
    },
    // ... more clubs
  ];
  
  await Club.insertMany(clubs);
  console.log('Seeded', clubs.length, 'clubs');
};

module.exports = { seedClubs };
```

| Task | Status |
|------|--------|
| ⬜ Create seed script for auth-service | |
| ⬜ Create seed script for club-service | |
| ⬜ Create seed script for event-service | |
| ⬜ Add seed commands to package.json | |

---

## 📊 Progress Tracker

### Weekly Summary

| Week | Phase | Focus Area | Target Completion |
|------|-------|------------|-------------------|
| 0 | Security | Credential rotation, secret removal | Day 1 |
| 1 | Standardization | Folder structure, module consistency | 100% |
| 2 | Configuration | ConfigManager, .env files | 100% |
| 2-3 | Logging | Winston logger, error handling | 100% |
| 3 | Database | Indexes, migrations, schema fixes | 100% |
| 4 | Architecture | Async events, resilience patterns | 100% |
| 5 | DevOps | Docker, health checks, scripts | 100% |
| 6 | Documentation | Diagrams, tests, README | 100% |

### Completion Checklist

```
Phase 0: Security          [_/_] tasks completed
Phase 1: Standardization   [_/_] tasks completed
Phase 2: Configuration     [_/_] tasks completed ✅
Phase 3: Logging           [8/8] tasks completed ✅
Phase 4: Database          [12/12] tasks completed ✅
Phase 5: Architecture      [5/5] tasks completed ✅
Phase 6: DevOps            [_/_] tasks completed
Phase 7: Documentation     [_/_] tasks completed
```

---

## 🎯 Success Criteria

When this roadmap is complete, the system should:

1. ✅ **Security:** No credentials in code, all secrets via environment variables
2. ✅ **Consistency:** All services follow the same folder structure
3. ✅ **Configuration:** Centralized, validated config in each service
4. ✅ **Logging:** Structured JSON logs with correlation IDs
5. ✅ **Error Handling:** Consistent error response format across all services
6. ✅ **Database:** Proper indexes, migrations, and schema validation
7. ✅ **Architecture:** Async events replace synchronous HTTP calls
8. ✅ **Docker:** Production-ready Dockerfiles with health checks
9. ✅ **DevOps:** Standard npm scripts for CI/CD integration
10. ✅ **Documentation:** Up-to-date README with architecture diagrams

---

## 📚 Resources

- [12 Factor App Methodology](https://12factor.net/)
- [Microservices Patterns by Chris Richardson](https://microservices.io/patterns/)
- [Winston Logger Documentation](https://github.com/winstonjs/winston)
- [migrate-mongo Documentation](https://github.com/seppevs/migrate-mongo)
- [Kong Gateway Documentation](https://docs.konghq.com/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

---

*Last Updated: November 25, 2025*

