import express from 'express';
import { getEvents, handleEventRSVP, joinEvent } from '../controllers/eventController.js';
import { authMiddleware, requireUser } from '../middlewares/authMiddleware.js';

const eventRoutes = express.Router();
const rsvpRoutes = express.Router();
const joinRoutes = express.Router();

// Public routes
eventRoutes.get('/api/events', getEvents);

// Protected routes - require authentication from API Gateway
rsvpRoutes.post('/api/events/:event_id/rsvp', authMiddleware, requireUser, handleEventRSVP);
joinRoutes.post('/api/events/:id/join', authMiddleware, requireUser, joinEvent);

export { eventRoutes, rsvpRoutes, joinRoutes };