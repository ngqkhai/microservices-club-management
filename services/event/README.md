# 🎯 Event Service - Complete Guide

Event Management microservice with MongoDB Atlas integration, supporting US-014 (Join Event) and US-015 (Leave Event) APIs.

## 🚀 Quick Start

### Docker (Recommended)
```bash
# Start Event Service (connects to MongoDB Atlas automatically)
docker-compose up -d event-service

# Test APIs
curl http://localhost:3003/health
curl -X POST http://localhost:3003/api/events/507f1f77bcf86cd799439012/join \
  -H "X-User-ID: test-user-123" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Role: USER"
```

### Local Development
```bash
cd services/event
npm install
cp .env.example .env  # Edit with your MongoDB Atlas URI
npm run dev
```

---

## 📋 API Endpoints

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/health` | Service health check | ✅ |
| `POST` | `/api/events/{id}/join` | **US-014: Join Event** | ✅ |
| `DELETE` | `/api/events/{id}/leave` | **US-015: Leave Event** | ✅ |

### Authentication
- **Method**: API Gateway headers (Kong)
- **Required Headers**: `X-User-ID`, `X-User-Email`, `X-User-Role`
- **No JWT verification** in service

---

## 🧪 Testing

### Automated Tests (100% Pass Rate)
```bash
# Setup test data first
cd tests
node setup-test-data-quick.js

# Run all tests
node test-all-events.js

# Individual tests
node test-join-event.js   # US-014 tests
node test-leave-event.js  # US-015 tests
```

### Manual Testing
```bash
# Join Event
curl -X POST http://localhost:3003/api/events/507f1f77bcf86cd799439012/join \
  -H "X-User-ID: test-user-123" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Role: USER"

# Leave Event  
curl -X DELETE http://localhost:3003/api/events/507f1f77bcf86cd799439011/leave \
  -H "X-User-ID: test-user-123" \
  -H "X-User-Email: test@example.com" \
  -H "X-User-Role: USER"
```

### Postman Collections
- `tests/postman/US-014-Join-Event.postman_collection.json`
- `tests/postman/US-015-Leave-Event.postman_collection.json`

---

## 🗄️ Database

### MongoDB Atlas Configuration
```bash
# Current setup (.env)
MONGODB_URI=
PORT=3003
NODE_ENV=development
```

### Collections
- **`events`**: Event information
- **`participants`**: User participation records

### Access Database
- **Atlas Dashboard**: https://cloud.mongodb.com
- **MongoDB Compass**: Use connection string from .env
- **mongosh**: `mongosh "mongodb+srv://cluster0.leew142.mongodb.net/event_service" --username phatk222`

---

## 🐳 Docker

### Dockerfile Features
- Multi-stage build (dev/production)
- Node.js 18 Alpine base
- Health checks
- Non-root user for security

### Docker Commands
```bash
# Development
docker build --target development -t event-service:dev .
docker run -p 3003:3003 --env-file .env event-service:dev

# Production
docker build --target production -t event-service:prod .

# With docker-compose
docker-compose up -d event-service
docker-compose logs -f event-service
```

---

## 📊 API Response Examples

### Join Event Success (201)
```json
{
  "status": "success",
  "message": "Joined event successfully",
  "data": {
    "eventId": "507f1f77bcf86cd799439012",
    "userId": "test-user-123",
    "joinedAt": "2025-07-04T10:30:00.000Z",
    "eventTitle": "Test Event for Join",
    "eventStartAt": "2025-07-05T14:00:00.000Z"
  }
}
```

### Leave Event Success (200)
```json
{
  "status": "success",
  "message": "Left event successfully",
  "data": {
    "eventId": "507f1f77bcf86cd799439011",
    "userId": "test-user-123", 
    "leftAt": "2025-07-04T10:30:00.000Z",
    "eventTitle": "Sample Event",
    "eventStartAt": "2025-07-05T14:00:00.000Z"
  }
}
```

### Error Responses
```json
// Already Joined (400)
{"status": 400, "error": "ALREADY_JOINED", "message": "You have already joined this event"}

// Not Joined (400)  
{"status": 400, "error": "NOT_JOINED", "message": "You have not joined this event"}

// Event Not Found (404)
{"status": 404, "error": "EVENT_NOT_FOUND", "message": "Event not found"}

// Missing Auth (401)
{"status": 401, "error": "AUTH_REQUIRED", "message": "Authentication headers required"}
```

---

## 🔧 Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs event-service

# Rebuild
docker-compose build --no-cache event-service
```

### Database Connection Issues
```bash
# Test connection
docker-compose exec event-service node -e "
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas connected'))
  .catch(err => console.error('❌ Connection failed:', err.message));
"

# Check Atlas status: https://status.mongodb.com
# Verify IP whitelist in Atlas dashboard
```

### Test Failures
```bash
# Reset test data
cd tests
node setup-test-data-quick.js

# Check service is running
curl http://localhost:3003/health
```

---

## 📁 Project Structure

```
services/event/
├── src/
│   ├── controllers/eventController.js    # API logic
│   ├── services/eventService.js          # Business logic  
│   ├── routes/eventRoutes.js             # Route definitions
│   ├── models/event.js                   # Event schema
│   ├── models/participant.js             # Participant schema
│   ├── middlewares/authMiddleware.js     # Auth validation
│   ├── config/database.js               # MongoDB connection
│   └── index.js                         # App entry point
├── tests/
│   ├── test-all-events.js               # Integration tests
│   ├── test-join-event.js               # US-014 tests
│   ├── test-leave-event.js              # US-015 tests
│   ├── setup-test-data-quick.js         # Test data setup
│   └── postman/                         # Postman collections
├── Dockerfile                           # Docker configuration
├── .dockerignore                        # Docker build optimization
├── package.json                         # Dependencies
└── README.md                            # This file
```

---

## ✅ Production Checklist

- [x] MongoDB Atlas integration
- [x] API Gateway authentication  
- [x] Comprehensive error handling
- [x] Input validation
- [x] Health checks
- [x] Docker containerization
- [x] Automated tests (100% pass rate)
- [x] API documentation
- [x] Security best practices

---

## 🎉 Success Metrics

- ✅ **US-014 & US-015** fully implemented
- ✅ **100% test pass rate** achieved
- ✅ **Production-ready** Docker setup
- ✅ **MongoDB Atlas** cloud integration
- ✅ **Complete documentation**

The Event Service is ready for frontend integration and production deployment! 🚀

# Production mode
npm start
```

## 📊 Database Schema

The service uses the following MongoDB collections:

### Events
- **Collection**: `events`
- **Purpose**: Store event details
- **Key Fields**: `club_id`, `title`, `description`, `location`, `start_at`, `end_at`, `fee`, `status`

### Organizers
- **Collection**: `organizers`
- **Purpose**: Map users to events they organize
- **Key Fields**: `event_id`, `user_id`

### Registrations
- **Collection**: `registrations`
- **Purpose**: Track user registrations for events
- **Key Fields**: `event_id`, `user_id`, `ticket_id`, `payment_id`, `status`

### Event Interests
- **Collection**: `event_interests`
- **Purpose**: Track user interests in events
- **Key Fields**: `event_id`, `user_id`

### Event Tasks
- **Collection**: `event_tasks`
- **Purpose**: Manage tasks related to event organization
- **Key Fields**: `event_id`, `title`, `status`, `assignee_id`, `due_date`

### Participants
- **Collection**: `participants`
- **Purpose**: Track event participants (for join functionality)
- **Key Fields**: `event_id`, `user_id`, `joined_at`

## 🛠️ Available Scripts

```bash
npm start          # Start the production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
```

## 🔌 API Endpoints

### Events
- `GET /api/events` - Get filtered events
- `POST /api/events/:id/join` - Join an event

### RSVP
- `POST /api/events/:event_id/rsvp` - RSVP to an event

### Health Check
- `GET /health` - Service health check

## 🧪 Sample Data

The seeding script creates:
- 5 sample events across different clubs
- 7 organizer relationships
- 5 event registrations
- 7 event interests
- 5 event tasks with different statuses
- 5 participants for join functionality testing

## 🔧 Environment Variables

```env
# MongoDB Atlas Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/event_service

# Server Configuration
PORT=3003
NODE_ENV=development

# External Services
AUTH_SERVICE_URL=http://localhost:3001
CLUB_SERVICE_URL=http://localhost:3002
FINANCE_SERVICE_URL=http://localhost:3003
```

## 🧪 Testing the Join Event Endpoint

```bash
# Join an event (success)
curl -X POST http://localhost:3003/api/events/<event_id>/join

# Try to join the same event again (already joined error)
curl -X POST http://localhost:3003/api/events/<event_id>/join

# Try to join non-existent event (not found error)
curl -X POST http://localhost:3003/api/events/invalid/join
```

## 🚨 Troubleshooting

### Database Connection Issues

If you see connection errors like `ECONNREFUSED ::1:27017`:

1. **Check Environment Variable**: Ensure `MONGODB_URI` (not `MONGO_URI`) is set in your `.env` file
2. **Verify MongoDB Atlas Connection**: Make sure your MongoDB Atlas cluster is running and accessible
3. **Check Network Access**: Ensure your IP is whitelisted in MongoDB Atlas Network Access
4. **Verify Credentials**: Double-check username and password in connection string

### Common Fixes

```bash
# Verify environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.error('❌ Failed:', err.message));
"
```

### Port Configuration
The service runs on port **3003** (as configured in `.env`), not 3000 as mentioned in some examples.

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **dotenv**: Environment variable management
- **uuid**: Generate unique identifiers
- **qrcode**: QR code generation
- **nodemon**: Development auto-reload

## 🏗️ Project Structure

```
src/
├── config/
│   ├── database.js      # MongoDB connection
│   └── index.js         # Config exports
├── models/
│   ├── event.js         # Event model
│   ├── organizer.js     # Organizer model
│   ├── registration.js  # Registration model
│   ├── eventInterest.js # Interest model
│   ├── eventTask.js     # Task model
│   ├── participant.js   # Participant model
│   └── index.js         # Model exports
├── routes/
│   └── eventRoutes.js   # API routes
├── controllers/
│   └── eventController.js # Route handlers
├── services/
│   └── eventService.js  # Business logic
├── scripts/
│   └── seedData.js      # Database seeding
└── index.js             # Application entry point
```
