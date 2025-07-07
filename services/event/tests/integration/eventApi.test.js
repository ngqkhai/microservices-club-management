import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { eventRoutes } from '../../src/routes/eventRoutes.js';
import * as eventController from '../../src/controllers/eventController.js';

// Mock the middleware and controller functions
jest.mock('../../src/middlewares/authMiddleware', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 'user123' };
    next();
  },
  requireClubManager: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use('/', eventRoutes);

describe('Event API Integration Tests', () => {
  
  // Spy on the actual controller methods
  const createEventSpy = jest.spyOn(eventController, 'createEvent');
  const updateEventSpy = jest.spyOn(eventController, 'updateEvent');

  afterEach(() => {
    createEventSpy.mockClear();
    updateEventSpy.mockClear();
  });
  
  describe('POST /api/events', () => {
    it('should call the createEvent controller and return 201', async () => {
      const eventData = { title: 'Integration Test Event', club_id: 'club1' };
      createEventSpy.mockImplementation((req, res) => res.status(201).json(eventData));

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(createEventSpy).toHaveBeenCalled();
      expect(response.body.title).toBe('Integration Test Event');
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should call the updateEvent controller and return 200', async () => {
      const eventId = 'event123';
      const eventData = { title: 'Updated Event' };
      updateEventSpy.mockImplementation((req, res) => res.status(200).json({ ...eventData, id: eventId }));

      const response = await request(app)
        .put(`/api/events/${eventId}`)
        .send(eventData);

      expect(response.status).toBe(200);
      expect(updateEventSpy).toHaveBeenCalled();
      expect(response.body.title).toBe('Updated Event');
    });
  });
}); 