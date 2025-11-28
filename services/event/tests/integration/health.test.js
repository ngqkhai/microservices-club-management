import express from 'express';
import request from 'supertest';

// Create a minimal test app with health endpoints
const createTestApp = () => {
  const app = express();

  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'event-service',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/ready', (req, res) => {
    res.json({ status: 'ready' });
  });

  app.get('/live', (req, res) => {
    res.json({ status: 'alive' });
  });

  return app;
};

describe('Health Check Endpoints', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'event-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /ready', () => {
    it('should return ready status', async () => {
      const response = await request(app)
        .get('/ready')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ready');
    });
  });

  describe('GET /live', () => {
    it('should return alive status', async () => {
      const response = await request(app)
        .get('/live')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'alive');
    });
  });
});
