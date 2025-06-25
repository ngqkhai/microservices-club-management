import express from 'express';
import { getEvents, handleEventRSVP } from '../controllers/eventController.js';

const eventRoutes = express.Router();
const rsvpRoutes = express.Router();

eventRoutes.get('/api/events', getEvents);
rsvpRoutes.post('/api/events/:event_id/rsvp', handleEventRSVP);

export { eventRoutes, rsvpRoutes };