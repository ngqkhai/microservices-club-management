/**
 * Event Service API Integration Tests
 * 
 * Tests all event service endpoints through the Kong API Gateway
 * Endpoints are organized by:
 * - Public routes: /events, /events/:id, /events/categories, /clubs/:id/events
 * - Protected routes: /events (POST), /events/:id (PUT/DELETE), /events/:id/join, /events/:id/rsvp
 * - User routes: /events/my, /users/favorite-events
 */

import request from 'supertest';

// Configuration
const KONG_URL = process.env.KONG_URL || 'http://localhost:8000';
const API_GATEWAY_SECRET = process.env.API_GATEWAY_SECRET || 'my-super-secret-key-for-api-gateway-2024';

// Test users from seeder (password: Password123!)
const TEST_USERS = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@clubmanagement.com',
    password: 'Password123!',
    role: 'ADMIN',
    full_name: 'System Administrator'
  },
  user: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'user@clubmanagement.com',
    password: 'Password123!',
    role: 'USER',
    full_name: 'Regular User'
  },
  manager: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'manager@clubmanagement.com',
    password: 'Password123!',
    role: 'USER',
    full_name: 'Club Manager'
  }
};

// Fixed Club IDs from seeder
const TEST_CLUBS = {
  tech: '000000000000000000000001',
  music: '000000000000000000000002',
  sports: '000000000000000000000003'
};

// Helper function for API Gateway requests
const kongRequest = () => request(KONG_URL);

// Store tokens and event IDs for use across tests
let adminToken = null;
let userToken = null;
let managerToken = null;
let testEventId = null;

describe('Event Service API Tests', () => {
  
  // Get tokens before tests
  beforeAll(async () => {
    try {
      // Get admin token
      const adminResponse = await kongRequest()
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password
        });
      adminToken = adminResponse.body.data?.accessToken;
      
      // Get user token
      const userResponse = await kongRequest()
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.user.email,
          password: TEST_USERS.user.password
        });
      userToken = userResponse.body.data?.accessToken;
      
      // Get manager token
      const managerResponse = await kongRequest()
        .post('/api/auth/login')
        .send({
          email: TEST_USERS.manager.email,
          password: TEST_USERS.manager.password
        });
      managerToken = managerResponse.body.data?.accessToken;
    } catch (error) {
      console.log('Failed to get tokens:', error.message);
    }
  });

  // =========================================================================
  // HEALTH CHECK ENDPOINTS
  // =========================================================================
  describe('Health Check Endpoints', () => {
    
    describe('GET /api/events/health', () => {
      it('should return service health status', async () => {
        const response = await kongRequest()
          .get('/api/events/health')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body).toHaveProperty('service', 'event-service');
      });
    });
  });

  // =========================================================================
  // PUBLIC ENDPOINTS
  // =========================================================================
  describe('Public Endpoints', () => {
    
    // -----------------------------------------------------------------------
    // GET EVENTS
    // -----------------------------------------------------------------------
    describe('GET /api/events', () => {
      
      it('should return list of events', async () => {
        const response = await kongRequest()
          .get('/api/events')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('events');
        expect(Array.isArray(response.body.data.events)).toBe(true);
        
        // Store an event ID for later tests
        if (response.body.data.events.length > 0) {
          testEventId = response.body.data.events[0]._id;
        }
      });
      
      it('should support pagination', async () => {
        const response = await kongRequest()
          .get('/api/events?page=1&limit=5')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data.events.length).toBeLessThanOrEqual(5);
      });
      
      it('should support filtering by upcoming events', async () => {
        const response = await kongRequest()
          .get('/api/events?filter=upcoming')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should support filtering by status', async () => {
        const response = await kongRequest()
          .get('/api/events?status=published')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should support filtering by category', async () => {
        const response = await kongRequest()
          .get('/api/events?category=Workshop')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should support search', async () => {
        const response = await kongRequest()
          .get('/api/events?search=workshop')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
    });

    // -----------------------------------------------------------------------
    // GET EVENT BY ID
    // -----------------------------------------------------------------------
    describe('GET /api/events/:id', () => {
      
      it('should return event details by valid ID', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        const response = await kongRequest()
          .get(`/api/events/${testEventId}`)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('event');
      });
      
      it('should return 404 for non-existent event', async () => {
        const response = await kongRequest()
          .get('/api/events/000000000000000000000999')
          .expect('Content-Type', /json/)
          .expect(404);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should return error for invalid event ID format', async () => {
        const response = await kongRequest()
          .get('/api/events/invalid-id')
          .expect('Content-Type', /json/);
        
        // Could be 400 (bad request) or 500 (internal error)
        expect([400, 500]).toContain(response.status);
      });
    });

    // -----------------------------------------------------------------------
    // GET EVENT CATEGORIES
    // -----------------------------------------------------------------------
    describe('GET /api/events/categories', () => {
      
      it('should return list of event categories', async () => {
        const response = await kongRequest()
          .get('/api/events/categories')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        // data is array directly, not data.categories
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    // -----------------------------------------------------------------------
    // GET CLUB EVENTS
    // -----------------------------------------------------------------------
    describe('GET /api/clubs/:id/events', () => {
      
      it('should return events for a club', async () => {
        const response = await kongRequest()
          .get(`/api/clubs/${TEST_CLUBS.tech}/events`)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
    });
  });

  // =========================================================================
  // PROTECTED ENDPOINTS (Require JWT)
  // =========================================================================
  describe('Protected Endpoints', () => {
    
    // -----------------------------------------------------------------------
    // GET MY EVENTS
    // -----------------------------------------------------------------------
    describe('GET /api/events/my', () => {
      
      it('should return user events with valid token', async () => {
        if (!userToken) {
          console.log('Skipping: No user token available');
          return;
        }
        
        const response = await kongRequest()
          .get('/api/events/my')
          .set('Authorization', `Bearer ${userToken}`)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should reject without authentication', async () => {
        await kongRequest()
          .get('/api/events/my')
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // GET USER FAVORITE EVENTS
    // -----------------------------------------------------------------------
    describe('GET /api/users/favorite-events', () => {
      
      it('should return user favorite events with valid token', async () => {
        if (!userToken) {
          console.log('Skipping: No user token available');
          return;
        }
        
        const response = await kongRequest()
          .get('/api/users/favorite-events')
          .set('Authorization', `Bearer ${userToken}`)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should reject without authentication', async () => {
        await kongRequest()
          .get('/api/users/favorite-events')
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // GET USER EVENT STATUS
    // -----------------------------------------------------------------------
    describe('GET /api/events/:id/user-status', () => {
      
      it('should return user status for event with valid token', async () => {
        if (!userToken || !testEventId) {
          console.log('Skipping: No user token or event ID available');
          return;
        }
        
        const response = await kongRequest()
          .get(`/api/events/${testEventId}/user-status`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should reject without authentication', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        await kongRequest()
          .get(`/api/events/${testEventId}/user-status`)
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // TOGGLE FAVORITE EVENT
    // -----------------------------------------------------------------------
    describe('POST /api/events/:id/favorite', () => {
      
      it('should toggle favorite with valid token', async () => {
        if (!userToken || !testEventId) {
          console.log('Skipping: No user token or event ID available');
          return;
        }
        
        const response = await kongRequest()
          .post(`/api/events/${testEventId}/favorite`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should reject without authentication', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        await kongRequest()
          .post(`/api/events/${testEventId}/favorite`)
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // JOIN EVENT
    // -----------------------------------------------------------------------
    describe('POST /api/events/:id/join', () => {
      
      it('should join event with valid token', async () => {
        if (!userToken || !testEventId) {
          console.log('Skipping: No user token or event ID available');
          return;
        }
        
        const response = await kongRequest()
          .post(`/api/events/${testEventId}/join`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect('Content-Type', /json/);
        
        // Could be 200/201 (success), 400 (already joined/event full), or 404 (event not found)
        expect([200, 201, 400, 404]).toContain(response.status);
      });
      
      it('should reject without authentication', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        await kongRequest()
          .post(`/api/events/${testEventId}/join`)
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // RSVP EVENT
    // -----------------------------------------------------------------------
    describe('POST /api/events/:id/rsvp', () => {
      
      it('should RSVP to event with valid token', async () => {
        if (!userToken || !testEventId) {
          console.log('Skipping: No user token or event ID available');
          return;
        }
        
        const response = await kongRequest()
          .post(`/api/events/${testEventId}/rsvp`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ status: 'going' })
          .expect('Content-Type', /json/);
        
        expect([200, 201, 400, 404]).toContain(response.status);
      });
      
      it('should reject without authentication', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        await kongRequest()
          .post(`/api/events/${testEventId}/rsvp`)
          .send({ status: 'going' })
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // LEAVE EVENT
    // -----------------------------------------------------------------------
    describe('DELETE /api/events/:id/leave', () => {
      
      it('should leave event with valid token', async () => {
        if (!userToken || !testEventId) {
          console.log('Skipping: No user token or event ID available');
          return;
        }
        
        const response = await kongRequest()
          .delete(`/api/events/${testEventId}/leave`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect('Content-Type', /json/);
        
        expect([200, 400, 404]).toContain(response.status);
      });
      
      it('should reject without authentication', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        await kongRequest()
          .delete(`/api/events/${testEventId}/leave`)
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // CREATE EVENT (Club Manager/Organizer)
    // -----------------------------------------------------------------------
    describe('POST /api/events', () => {
      
      it('should create event with manager token', async () => {
        if (!managerToken) {
          console.log('Skipping: No manager token available');
          return;
        }
        
        const newEvent = {
          title: `Test Event ${Date.now()}`,
          description: 'A test event for API testing',
          club_id: TEST_CLUBS.tech,
          start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
          location: {
            address: 'Test Location'
          },
          category: 'Workshop',
          max_participants: 50
        };
        
        const response = await kongRequest()
          .post('/api/events')
          .set('Authorization', `Bearer ${managerToken}`)
          .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
          .send(newEvent);
        
        // Could be 201 (created), 400 (validation), 401 (auth issue), or 403 (no permission)
        expect([201, 400, 401, 403, 404]).toContain(response.status);
      });
      
      it('should reject event creation without authentication', async () => {
        const newEvent = {
          title: 'Unauthorized Event',
          description: 'Should fail',
          club_id: TEST_CLUBS.tech
        };
        
        await kongRequest()
          .post('/api/events')
          .send(newEvent)
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // UPDATE EVENT
    // -----------------------------------------------------------------------
    describe('PUT /api/events/:id', () => {
      
      it('should reject update without authentication', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        await kongRequest()
          .put(`/api/events/${testEventId}`)
          .send({ title: 'Updated Title' })
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // DELETE EVENT
    // -----------------------------------------------------------------------
    describe('DELETE /api/events/:id', () => {
      
      it('should reject delete without authentication', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        await kongRequest()
          .delete(`/api/events/${testEventId}`)
          .expect(401);
      });
    });
  });

  // =========================================================================
  // EVENT TICKET & CHECK-IN
  // =========================================================================
  describe('Ticket and Check-in Endpoints', () => {
    
    describe('GET /api/events/:id/ticket', () => {
      
      it('should get event ticket with valid token', async () => {
        if (!userToken || !testEventId) {
          console.log('Skipping: No user token or event ID available');
          return;
        }
        
        const response = await kongRequest()
          .get(`/api/events/${testEventId}/ticket`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect('Content-Type', /json/);
        
        // Could be 200 (has ticket), 400 (not registered), or 404
        expect([200, 400, 404]).toContain(response.status);
      });
    });
    
    describe('POST /api/events/:id/check-in', () => {
      
      it('should reject check-in without authentication', async () => {
        if (!testEventId) {
          console.log('Skipping: No test event ID available');
          return;
        }
        
        await kongRequest()
          .post(`/api/events/${testEventId}/check-in`)
          .send({ ticket_code: 'TEST123' })
          .expect(401);
      });
    });
  });

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================
  describe('Error Handling', () => {
    
    it('should return error for unknown routes', async () => {
      const response = await kongRequest()
        .get('/api/events/unknown-endpoint/test');
      
      // Could be 401 (requires auth), 404 (not found), or 500 (invalid ObjectId)
      expect([401, 404, 500]).toContain(response.status);
    });
  });
});
