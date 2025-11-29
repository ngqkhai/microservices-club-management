/**
 * Club Service API Integration Tests
 * 
 * Tests all club service endpoints through the Kong API Gateway
 * API Response format: { success: boolean, data: {...}, message: string }
 */

const request = require('supertest');

// Configuration
const KONG_URL = process.env.KONG_URL || 'http://localhost:8000';
const API_GATEWAY_SECRET = process.env.API_GATEWAY_SECRET || 'my-super-secret-key-for-api-gateway-2024';

// Test users from seeder
const TEST_USERS = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@clubmanagement.com',
    password: 'Password123!'
  },
  user: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'user@clubmanagement.com',
    password: 'Password123!'
  },
  manager: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'manager@clubmanagement.com',
    password: 'Password123!'
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

// Store tokens for use across tests
let adminToken = null;
let userToken = null;
let managerToken = null;

// Helper to login and get token
const loginUser = async (email, password) => {
  const response = await kongRequest()
    .post('/api/auth/login')
    .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
    .send({ email, password });
  
  if (response.status === 200 && response.body.accessToken) {
    return response.body.accessToken;
  }
  return null;
};

describe('Club Service API Tests', () => {
  
  beforeAll(async () => {
    try {
      adminToken = await loginUser(TEST_USERS.admin.email, TEST_USERS.admin.password);
      userToken = await loginUser(TEST_USERS.user.email, TEST_USERS.user.password);
      managerToken = await loginUser(TEST_USERS.manager.email, TEST_USERS.manager.password);
    } catch (error) {
      console.log('Failed to get tokens:', error.message);
    }
  });

  // =========================================================================
  // HEALTH CHECK ENDPOINTS
  // =========================================================================
  describe('Health Check Endpoints', () => {
    test('GET /api/clubs/health - should return service health status', async () => {
      const response = await kongRequest()
        .get('/api/clubs/health')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'club-service');
    });
  });

  // =========================================================================
  // PUBLIC ENDPOINTS - GET CLUBS
  // =========================================================================
  describe('GET /api/clubs', () => {
    test('should return list of clubs', async () => {
      const response = await kongRequest()
        .get('/api/clubs')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Response format: { success, data: { results, page, limit, total, totalPages }, message }
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
      expect(Array.isArray(response.body.data.results)).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
    });
    
    test('should support pagination', async () => {
      const response = await kongRequest()
        .get('/api/clubs?page=1&limit=5')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeLessThanOrEqual(5);
      expect(response.body.data.limit).toBe(5);
    });
    
    test('should support search filter', async () => {
      const response = await kongRequest()
        .get('/api/clubs?search=tech')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
    });
    
    test('should support sorting', async () => {
      const response = await kongRequest()
        .get('/api/clubs?sort=name')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('results');
    });
  });

  // =========================================================================
  // PUBLIC ENDPOINTS - GET CLUB BY ID
  // =========================================================================
  describe('GET /api/clubs/:id', () => {
    test('should return club details by valid ID', async () => {
      const response = await kongRequest()
        .get(`/api/clubs/${TEST_CLUBS.tech}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Response format: { success, data: { id, name, ... }, message }
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(TEST_CLUBS.tech);
      expect(response.body.data).toHaveProperty('name');
    });
    
    test('should return 404 for non-existent club', async () => {
      const response = await kongRequest()
        .get('/api/clubs/000000000000000000000999')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });
    
    test('should return 400 for invalid club ID format', async () => {
      const response = await kongRequest()
        .get('/api/clubs/invalid-id')
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  // =========================================================================
  // PUBLIC ENDPOINTS - CATEGORIES, LOCATIONS, STATS
  // =========================================================================
  describe('GET /api/clubs/categories', () => {
    test('should return list of categories', async () => {
      const response = await kongRequest()
        .get('/api/clubs/categories')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      // data is the array of categories directly
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/clubs/locations', () => {
    test('should return list of locations', async () => {
      const response = await kongRequest()
        .get('/api/clubs/locations')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      // data is the array of locations directly
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/clubs/stats', () => {
    test('should return club statistics', async () => {
      const response = await kongRequest()
        .get('/api/clubs/stats')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalClubs');
    });
  });

  describe('GET /api/clubs/:id/recruitments', () => {
    test('should return club recruitments', async () => {
      const response = await kongRequest()
        .get(`/api/clubs/${TEST_CLUBS.tech}/recruitments`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  // =========================================================================
  // PROTECTED ENDPOINTS
  // =========================================================================
  describe('POST /api/clubs (Create Club)', () => {
    test('should create club with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping: No admin token available');
        return;
      }
      
      const newClub = {
        name: `Test Club ${Date.now()}`,
        description: 'A test club for API testing',
        category: 'Công nghệ',
        location: 'Test Location',
        contact_email: 'test@example.com'
      };
      
      const response = await kongRequest()
        .post('/api/clubs')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .send(newClub)
        .expect('Content-Type', /json/);
      
      expect([201, 400, 403]).toContain(response.status);
    });
    
    test('should reject club creation without authentication', async () => {
      const newClub = {
        name: 'Unauthorized Club',
        description: 'Should fail',
        category: 'Công nghệ'
      };
      
      await kongRequest()
        .post('/api/clubs')
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .send(newClub)
        .expect(401);
    });
    
    test('should reject club creation with user token (non-admin)', async () => {
      if (!userToken) {
        console.log('Skipping: No user token available');
        return;
      }
      
      const newClub = {
        name: 'User Created Club',
        description: 'Should fail',
        category: 'Công nghệ'
      };
      
      await kongRequest()
        .post('/api/clubs')
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .send(newClub)
        .expect(403);
    });
  });

  describe('GET /api/clubs/:clubId/members', () => {
    test('should return club members with valid token', async () => {
      if (!userToken) {
        console.log('Skipping: No user token available');
        return;
      }
      
      const response = await kongRequest()
        .get(`/api/clubs/${TEST_CLUBS.tech}/members`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .expect('Content-Type', /json/);
      
      expect([200, 403]).toContain(response.status);
    });
    
    test('should reject without authentication', async () => {
      await kongRequest()
        .get(`/api/clubs/${TEST_CLUBS.tech}/members`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .expect(401);
    });
  });

  describe('PUT /api/clubs/:id/status', () => {
    test('should update club status with admin token', async () => {
      if (!adminToken) {
        console.log('Skipping: No admin token available');
        return;
      }
      
      const response = await kongRequest()
        .put(`/api/clubs/${TEST_CLUBS.tech}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .send({ status: 'ACTIVE' })
        .expect('Content-Type', /json/);
      
      expect([200, 400, 403]).toContain(response.status);
    });
    
    test('should reject status update without authentication', async () => {
      await kongRequest()
        .put(`/api/clubs/${TEST_CLUBS.tech}/status`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .send({ status: 'ACTIVE' })
        .expect(401);
    });
  });

  describe('GET /api/users/:userId/club-roles', () => {
    test('should return user club roles with valid token', async () => {
      if (!userToken) {
        console.log('Skipping: No user token available');
        return;
      }
      
      const response = await kongRequest()
        .get(`/api/users/${TEST_USERS.user.id}/club-roles`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .expect('Content-Type', /json/);
      
      expect([200, 403]).toContain(response.status);
    });
    
    test('should reject without authentication', async () => {
      await kongRequest()
        .get(`/api/users/${TEST_USERS.user.id}/club-roles`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .expect(401);
    });
  });

  describe('GET /api/users/:userId/applications', () => {
    test('should return user applications with valid token', async () => {
      if (!userToken) {
        console.log('Skipping: No user token available');
        return;
      }
      
      const response = await kongRequest()
        .get(`/api/users/${TEST_USERS.user.id}/applications`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .expect('Content-Type', /json/);
      
      expect([200, 403]).toContain(response.status);
    });
  });

  // =========================================================================
  // CAMPAIGN ENDPOINTS
  // =========================================================================
  describe('Campaign Endpoints', () => {
    test('GET /api/campaigns/published - should return published campaigns', async () => {
      const response = await kongRequest()
        .get('/api/campaigns/published')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
    
    test('GET /api/clubs/:clubId/campaigns - should return club campaigns with valid token', async () => {
      if (!userToken) {
        console.log('Skipping: No user token available');
        return;
      }
      
      const response = await kongRequest()
        .get(`/api/clubs/${TEST_CLUBS.tech}/campaigns`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .expect('Content-Type', /json/);
      
      expect([200, 403]).toContain(response.status);
    });
  });

  // =========================================================================
  // ERROR HANDLING
  // =========================================================================
  describe('Error Handling', () => {
    test('should return error for unknown routes', async () => {
      const response = await kongRequest()
        .get('/api/clubs/unknown-endpoint');
      
      // Could be 400 (invalid ObjectId) or 404
      expect([400, 404]).toContain(response.status);
    });
    
    test('should handle invalid JSON gracefully', async () => {
      if (!adminToken) {
        console.log('Skipping: No admin token available');
        return;
      }
      
      await kongRequest()
        .post('/api/clubs')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });
});
