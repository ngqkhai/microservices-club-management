import express from 'express';
import { 
  getEvents, 
  handleEventRSVP, 
  joinEvent, 
  leaveEvent, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  getEventsOfClub,
  getEventById,
  getUserEventStatus,
  getEventRegistrations,
  toggleEventFavorite,
  getUserFavoriteEvents
} from '../controllers/eventController.js';
import { authMiddleware, requireUser, requireClubManager, requireClubManagerOrOrganizer, validateApiGatewaySecret } from '../middlewares/authMiddleware.js';

const eventRoutes = express.Router();

// CORS middleware for all routes
eventRoutes.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, x-api-gateway-secret, x-user-id, x-user-email, x-user-role, x-user-full-name');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '3600');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Public routes - require API Gateway secret validation only
eventRoutes.get('/api/events', validateApiGatewaySecret, getEvents);
eventRoutes.get('/api/events-test', validateApiGatewaySecret, getEvents); // TEST ROUTE
eventRoutes.get('/api/events/:id', validateApiGatewaySecret, getEventById);
eventRoutes.get('/api/clubs/:id/events', validateApiGatewaySecret, getEventsOfClub);

// Routes for creating, updating, and deleting events (admin, club manager, or organizer allowed)
eventRoutes.post('/api/events', authMiddleware, requireClubManagerOrOrganizer, createEvent);
eventRoutes.put('/api/events/:id', authMiddleware, requireClubManagerOrOrganizer, updateEvent);
eventRoutes.delete('/api/events/:id', authMiddleware, requireClubManagerOrOrganizer, deleteEvent);

// User-specific event data routes
eventRoutes.get('/api/events/:id/user-status', authMiddleware, requireUser, getUserEventStatus);
eventRoutes.post('/api/events/:id/favorite', authMiddleware, requireUser, toggleEventFavorite);
eventRoutes.get('/api/users/favorite-events', authMiddleware, requireUser, getUserFavoriteEvents);

// Event registration management routes
eventRoutes.get('/api/events/:id/registrations', authMiddleware, requireClubManagerOrOrganizer, getEventRegistrations);

// User interaction routes - require authentication from API Gateway
eventRoutes.post('/api/events/:id/rsvp', authMiddleware, requireUser, handleEventRSVP);
eventRoutes.post('/api/events/:id/join', authMiddleware, requireUser, joinEvent);
eventRoutes.delete('/api/events/:id/leave', authMiddleware, requireUser, leaveEvent);

export { eventRoutes };