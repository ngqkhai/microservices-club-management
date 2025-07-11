import express from 'express';
import { getEvents, handleEventRSVP, joinEvent, leaveEvent, createEvent, updateEvent, deleteEvent, getEventsOfClub } from '../controllers/eventController.js';
import { authMiddleware, requireUser, requireClubManager } from '../middlewares/authMiddleware.js';

const eventRoutes = express.Router();
const rsvpRoutes = express.Router();
const joinRoutes = express.Router();
const leaveRoutes = express.Router();

// Public routes
eventRoutes.get('/api/events', getEvents);
eventRoutes.get('/api/clubs/:id/events', getEventsOfClub);

// Routes for creating, updating, and deleting events
eventRoutes.post('/api/events', authMiddleware, requireClubManager, createEvent);
eventRoutes.put('/api/events/:id', authMiddleware, requireClubManager, updateEvent);
eventRoutes.delete('/api/events/:id', authMiddleware, requireClubManager, deleteEvent);

// Protected routes - require authentication from API Gateway
rsvpRoutes.post('/api/events/:event_id/rsvp', authMiddleware, requireUser, handleEventRSVP);
joinRoutes.post('/api/events/:id/join', authMiddleware, requireUser, joinEvent);
leaveRoutes.delete('/api/events/:id/leave', authMiddleware, requireUser, leaveEvent);

export { eventRoutes, rsvpRoutes, joinRoutes, leaveRoutes };