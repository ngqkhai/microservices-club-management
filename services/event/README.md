# Event Service - MongoDB Atlas Integration

This service manages events, registrations, participants, and related functionality using MongoDB Atlas.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd services/event
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your MongoDB Atlas connection string
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/event_service?retryWrites=true&w=majority
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Service
```bash
# Development mode
npm run dev

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
