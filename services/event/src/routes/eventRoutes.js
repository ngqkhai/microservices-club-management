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
  updateEventRegistrationStatus,
  getMyEvents,
  toggleEventFavorite,
  getUserFavoriteEvents,
  getEventCategories,
  getEventLocations,
  getEventTicket,
  checkInEvent
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
/**
 * @route GET /api/events
 * @desc Get events with comprehensive filtering and pagination
 * @access Public
 * @query {string} [filter] - Filter events: 'upcoming', 'all' (default: 'all')
 * @query {string} [club_id] - Filter by club ID (ObjectId)
 * @query {string} [status] - Filter by status: 'draft', 'published', 'cancelled', 'completed'
 * @query {string} [category] - Filter by category: 'Workshop', 'Seminar', 'Competition', 'Social', 'Fundraiser', 'Meeting', 'Other'
 * @query {string} [location] - Filter by location (partial match across address, room, detailed_location)
 * @query {string} [search] - Search across title, description, tags, location
 * @query {string} [start_from] - Filter events starting from this date (ISO format)
 * @query {string} [start_to] - Filter events starting before this date (ISO format)
 * @query {number} [page] - Page number for pagination (default: 1)
 * @query {number} [limit] - Items per page (default: 10, max: 100)
 */
eventRoutes.get('/api/events', validateApiGatewaySecret, getEvents);
/**
 * @route GET /api/events-test
 * @desc Test route for events with same filtering capabilities
 * @access Public
 */
eventRoutes.get('/api/events-test', validateApiGatewaySecret, getEvents); // TEST ROUTE
/**
 * @route GET /api/events/categories
 * @desc Get distinct event categories
 * @access Public
 */
eventRoutes.get('/api/events/categories', validateApiGatewaySecret, getEventCategories);
/**
 * @route GET /api/events/locations
 * @desc Get distinct event location addresses (and rooms when available)
 * @access Public
 */
eventRoutes.get('/api/events/locations', validateApiGatewaySecret, getEventLocations);

// Health check route - declare BEFORE :id to avoid matching 'health' as ID
eventRoutes.get('/api/events/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'event-service' });
});

// My events for authenticated user - declare BEFORE :id to avoid matching 'my' as ID
eventRoutes.get('/api/events/my', authMiddleware, requireUser, getMyEvents);
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
eventRoutes.put('/api/events/:id/registrations/:regId/status', authMiddleware, requireClubManagerOrOrganizer, updateEventRegistrationStatus);

// User interaction routes - require authentication from API Gateway
eventRoutes.post('/api/events/:id/rsvp', authMiddleware, requireUser, handleEventRSVP);
eventRoutes.post('/api/events/:id/join', authMiddleware, requireUser, joinEvent);
eventRoutes.delete('/api/events/:id/leave', authMiddleware, requireUser, leaveEvent);
// QR ticket issuance and check-in
eventRoutes.get('/api/events/:id/ticket', authMiddleware, requireUser, getEventTicket);
eventRoutes.post('/api/events/:id/check-in', authMiddleware, requireClubManagerOrOrganizer, checkInEvent);

// Version endpoint for deployment verification
eventRoutes.get('/version', (req, res) => {
  res.json({
    service: 'event-service',
    version: '1.0.1',
    deployedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    gitCommit: process.env.GIT_COMMIT || 'local-development',
    buildNumber: process.env.BUILD_NUMBER || Date.now().toString()
  });
});

export { eventRoutes };