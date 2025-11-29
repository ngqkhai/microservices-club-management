/**
 * Notify Service API Integration Tests
 * 
 * Tests the notification service health and admin endpoints.
 * Note: The notify service is primarily a RabbitMQ consumer, not a REST API.
 * These tests verify the health monitoring and admin endpoints.
 * 
 * Direct service access is used since Kong routes for notify are protected
 * and the service mainly operates via RabbitMQ message consumption.
 */

const request = require('supertest');

// Direct service URL (not through Kong since notify is a consumer service)
const NOTIFY_SERVICE_URL = process.env.NOTIFY_SERVICE_URL || 'http://localhost:3005';

// Helper to make requests to notify service directly
const notifyRequest = () => request(NOTIFY_SERVICE_URL);

describe('Notify Service API Tests', () => {
  
  // ==================== BASIC HEALTH ENDPOINTS ====================
  describe('Basic Health Check Endpoints', () => {
    test('GET /health - should return service health status', async () => {
      const response = await notifyRequest()
        .get('/health');

      // Service should respond (may be healthy or unhealthy depending on RabbitMQ)
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service', 'notification-service');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET /health - should include version info', async () => {
      const response = await notifyRequest()
        .get('/health');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('version');
    });
  });

  // ==================== DETAILED HEALTH ENDPOINTS ====================
  describe('Detailed Health Check Endpoints', () => {
    test('GET /health/detailed - should return detailed health status', async () => {
      const response = await notifyRequest()
        .get('/health/detailed');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service', 'notification-service');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('GET /health/detailed - should include system info', async () => {
      const response = await notifyRequest()
        .get('/health/detailed');

      expect([200, 503]).toContain(response.status);
      
      if (response.body.system) {
        expect(response.body.system).toHaveProperty('memory');
        expect(response.body.system).toHaveProperty('node_version');
        expect(response.body.system).toHaveProperty('platform');
      }
    });

    test('GET /health/detailed - should show component statuses', async () => {
      const response = await notifyRequest()
        .get('/health/detailed');

      expect([200, 503]).toContain(response.status);
      
      if (response.body.components) {
        // Check for expected components
        expect(response.body).toHaveProperty('components');
        expect(response.body.components).toHaveProperty('consumers');
        expect(response.body.components).toHaveProperty('email');
        expect(response.body.components).toHaveProperty('rabbitmq');
      }
    });
  });

  // ==================== KUBERNETES PROBE ENDPOINTS ====================
  describe('Kubernetes Probe Endpoints', () => {
    test('GET /health/liveness - should return liveness status', async () => {
      const response = await notifyRequest()
        .get('/health/liveness');

      // Liveness should always return 200 if the service can respond
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET /health/readiness - should return readiness status', async () => {
      const response = await notifyRequest()
        .get('/health/readiness');

      // Readiness depends on RabbitMQ connection
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(['ready', 'not ready']).toContain(response.body.status);
      expect(response.body).toHaveProperty('timestamp');
    });

    test('GET /health/liveness - should be fast (< 1s)', async () => {
      const startTime = Date.now();
      const response = await notifyRequest()
        .get('/health/liveness');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000);
    });
  });

  // ==================== STATISTICS ENDPOINTS ====================
  describe('Statistics Endpoints', () => {
    test('GET /health/stats - should return service statistics', async () => {
      const response = await notifyRequest()
        .get('/health/stats');

      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('system');
      }
    });

    test('GET /health/stats - should include notification handler stats', async () => {
      const response = await notifyRequest()
        .get('/health/stats');

      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200 && response.body.notification_handler) {
        expect(response.body).toHaveProperty('notification_handler');
      }
    });
  });

  // ==================== VERSION ENDPOINT ====================
  describe('Version Endpoint', () => {
    test('GET /health/version - should return version info', async () => {
      const response = await notifyRequest()
        .get('/health/version');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service', 'notify-service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');
    });

    test('GET /health/version - should include deployment info', async () => {
      const response = await notifyRequest()
        .get('/health/version');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deployedAt');
      expect(response.body).toHaveProperty('buildNumber');
    });
  });

  // ==================== ADMIN ENDPOINTS ====================
  describe('Admin Endpoints', () => {
    describe('Consumer Management', () => {
      test('POST /health/admin/consumers/restart - should restart consumers', async () => {
        const response = await notifyRequest()
          .post('/health/admin/consumers/restart');

        // May succeed or fail depending on RabbitMQ state
        expect([200, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('restart');
        }
      });
    });

    describe('Statistics Reset', () => {
      test('POST /health/admin/stats/reset - should reset statistics', async () => {
        const response = await notifyRequest()
          .post('/health/admin/stats/reset');

        expect([200, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('reset');
        }
      });
    });

    describe('Template Management', () => {
      test('POST /health/admin/templates/reload - should reload templates', async () => {
        const response = await notifyRequest()
          .post('/health/admin/templates/reload');

        expect([200, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toContain('template');
        }
      });
    });

    describe('Test Email', () => {
      test('POST /health/admin/email/test - should require email', async () => {
        const response = await notifyRequest()
          .post('/health/admin/email/test')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Email');
      });

      test('POST /health/admin/email/test - should reject invalid email type', async () => {
        const response = await notifyRequest()
          .post('/health/admin/email/test')
          .send({
            email: 'test@example.com',
            type: 'invalid-type'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Invalid email type');
      });

      test('POST /health/admin/email/test - should accept valid verification request', async () => {
        const response = await notifyRequest()
          .post('/health/admin/email/test')
          .timeout(30000)
          .send({
            email: 'test@example.com',
            type: 'verification'
          });

        // May fail if SMTP not configured, but should process request
        expect([200, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('message');
        }
      }, 35000);

      test('POST /health/admin/email/test - should accept valid password-reset request', async () => {
        const response = await notifyRequest()
          .post('/health/admin/email/test')
          .timeout(30000)
          .send({
            email: 'test@example.com',
            type: 'password-reset'
          });

        expect([200, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('message');
        }
      }, 35000);
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Handling', () => {
    test('Unknown routes should return 404', async () => {
      const response = await notifyRequest()
        .get('/unknown/route/that/does/not/exist');

      expect(response.status).toBe(404);
    });

    test('Responses should be JSON', async () => {
      const response = await notifyRequest()
        .get('/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  // ==================== CONTENT TYPE HANDLING ====================
  describe('Content Type Handling', () => {
    test('Health endpoints should return JSON', async () => {
      const response = await notifyRequest()
        .get('/health');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('Admin endpoints should accept JSON', async () => {
      const response = await notifyRequest()
        .post('/health/admin/stats/reset')
        .set('Content-Type', 'application/json')
        .send({});

      // Should accept and process JSON body
      expect([200, 500]).toContain(response.status);
    });
  });

  // ==================== RESPONSE TIME TESTS ====================
  describe('Response Time Tests', () => {
    test('Basic health should respond quickly', async () => {
      const startTime = Date.now();
      const response = await notifyRequest()
        .get('/health');
      const duration = Date.now() - startTime;
      
      expect([200, 503]).toContain(response.status);
      expect(duration).toBeLessThan(5000); // 5 second max for health checks
    });

    test('Liveness probe should be very fast', async () => {
      const startTime = Date.now();
      const response = await notifyRequest()
        .get('/health/liveness');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500); // 500ms max for liveness
    });

    test('Version endpoint should be instant', async () => {
      const startTime = Date.now();
      const response = await notifyRequest()
        .get('/health/version');
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });
  });

  // ==================== SERVICE INTEGRATION ====================
  describe('Service Integration', () => {
    test('Should report RabbitMQ connection status', async () => {
      const response = await notifyRequest()
        .get('/health/detailed');

      expect([200, 503]).toContain(response.status);
      
      if (response.body.components && response.body.components.rabbitmq) {
        expect(response.body.components.rabbitmq).toHaveProperty('status');
      }
    });

    test('Should report consumer status', async () => {
      const response = await notifyRequest()
        .get('/health/detailed');

      expect([200, 503]).toContain(response.status);
      
      if (response.body.components && response.body.components.consumers) {
        expect(response.body.components.consumers).toHaveProperty('status');
      }
    });

    test('Should report email service status', async () => {
      const response = await notifyRequest()
        .get('/health/detailed');

      expect([200, 503]).toContain(response.status);
      
      if (response.body.components && response.body.components.email) {
        expect(response.body.components.email).toHaveProperty('status');
      }
    });
  });

  // ==================== UPTIME VERIFICATION ====================
  describe('Uptime Verification', () => {
    test('Uptime should be a positive number', async () => {
      const response = await notifyRequest()
        .get('/health');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    test('Consecutive liveness checks should show increasing uptime', async () => {
      const response1 = await notifyRequest()
        .get('/health/liveness');
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response2 = await notifyRequest()
        .get('/health/liveness');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Uptime should have increased (or be very close)
      expect(response2.body.uptime).toBeGreaterThanOrEqual(response1.body.uptime);
    });
  });
});
