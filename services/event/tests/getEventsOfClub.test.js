import request from 'supertest';
import express from 'express';
import { eventRoutes } from '../src/routes/eventRoutes.js';
import { connectToDatabase } from '../src/config/database.js';
import mongoose from 'mongoose';
import nock from 'nock';

const app = express();
app.use(express.json());
app.use(eventRoutes);

beforeAll(async () => {
  await connectToDatabase();
  // Mock Club Service for club_001
  nock('http://club-service:3002')
    .persist()
    .get('/api/clubs/club_001')
    .reply(200, { id: 'club_001', name: 'Test Club' });
  // Optionally seed test data here
});

afterAll(async () => {
  await mongoose.connection.close();
  nock.cleanAll();
});

describe('GET /api/clubs/:id/events', () => {
  it('should return 404 if club does not exist', async () => {
    const res = await request(app)
      .get('/api/clubs/nonexistentclubid/events');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('CLUB_NOT_FOUND');
  });

  it('should return filtered events for a valid club', async () => {
    const clubId = 'club_001';
    const res = await request(app)
      .get(`/api/clubs/${clubId}/events`)
      .query({ status: 'upcoming', page: 1, limit: 10 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it('should filter by date range', async () => {
    const clubId = 'club_001';
    const res = await request(app)
      .get(`/api/clubs/${clubId}/events`)
      .query({ start_from: '2024-02-01', start_to: '2024-02-28' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
  });
}); 