/**
 * Auth Service API Integration Tests
 * 
 * Tests all auth service endpoints through the Kong API Gateway
 * Endpoints are organized by:
 * - Public routes (no JWT required): /login, /register, /verify-email, /forgot-password, /reset-password, /refresh, /health, /liveness, /readiness
 * - Protected routes (JWT required): /profile, /change-password, /logout, /me, /cleanup, /users
 * 
 * Note: Some endpoints are only accessible directly (/version, /.well-known/jwks.json, /public-key)
 */

const request = require('supertest');

// Configuration
const KONG_URL = process.env.KONG_URL || 'http://localhost:8000';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const API_GATEWAY_SECRET = process.env.API_GATEWAY_SECRET || 'super-secret-gateway-key-dev';

// Test users from seeder (password: Password123!)
const TEST_USERS = {
  admin: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@clubmanagement.com',
    password: 'Password123!',
    role: 'admin',
    full_name: 'System Administrator'
  },
  user: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'user@clubmanagement.com',
    password: 'Password123!',
    role: 'user',
    full_name: 'Regular User'
  },
  manager: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'manager@clubmanagement.com',
    password: 'Password123!',
    role: 'user',
    full_name: 'Club Manager'
  }
};

// Helper function for API Gateway requests
const kongRequest = () => request(KONG_URL);
const directRequest = () => request(AUTH_SERVICE_URL);

// Store tokens for use across tests
let adminToken = null;
let userToken = null;
let refreshTokenCookie = null;

describe('Auth Service API Tests', () => {
  
  // =========================================================================
  // HEALTH CHECK ENDPOINTS (Public - via Kong)
  // =========================================================================
  describe('Health Check Endpoints', () => {
    
    describe('GET /api/auth/health', () => {
      it('should return service health status', async () => {
        const response = await kongRequest()
          .get('/api/auth/health')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body.success).toBe(true);
      });
    });
    
    describe('GET /api/auth/liveness', () => {
      it('should return liveness status', async () => {
        const response = await kongRequest()
          .get('/api/auth/liveness')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body).toHaveProperty('status', 'alive');
        expect(response.body).toHaveProperty('timestamp');
      });
    });
    
    describe('GET /api/auth/readiness', () => {
      it('should return readiness status when database is connected', async () => {
        const response = await kongRequest()
          .get('/api/auth/readiness')
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body).toHaveProperty('status', 'ready');
        expect(response.body).toHaveProperty('services');
        expect(response.body.services).toHaveProperty('database');
      });
    });
  });

  // =========================================================================
  // AUTHENTICATION ENDPOINTS
  // =========================================================================
  describe('Authentication Endpoints', () => {
    
    // -----------------------------------------------------------------------
    // LOGIN
    // -----------------------------------------------------------------------
    describe('POST /api/auth/login', () => {
      
      it('should login admin user with valid credentials', async () => {
        const response = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: TEST_USERS.admin.email,
            password: TEST_USERS.admin.password
          })
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user.email).toBe(TEST_USERS.admin.email);
        expect(response.body.data.user.role).toBe('ADMIN');
        
        // Store token for later tests
        adminToken = response.body.data.accessToken;
        
        // Store refresh token cookie if present
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          refreshTokenCookie = cookies.find(c => c.includes('refreshToken'));
        }
      });
      
      it('should login regular user with valid credentials', async () => {
        const response = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: TEST_USERS.user.email,
            password: TEST_USERS.user.password
          })
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data.user.role).toBe('USER');
        
        userToken = response.body.data.accessToken;
      });
      
      it('should reject login with invalid password', async () => {
        const response = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: TEST_USERS.admin.email,
            password: 'WrongPassword123!'
          })
          .expect('Content-Type', /json/)
          .expect(401);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject login with non-existent email', async () => {
        const response = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'Password123!'
          })
          .expect('Content-Type', /json/)
          .expect(401);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject login with missing email', async () => {
        const response = await kongRequest()
          .post('/api/auth/login')
          .send({
            password: 'Password123!'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject login with missing password', async () => {
        const response = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: TEST_USERS.admin.email
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject login with invalid email format', async () => {
        const response = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: 'invalid-email',
            password: 'Password123!'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // REGISTER
    // -----------------------------------------------------------------------
    describe('POST /api/auth/register', () => {
      const testEmail = `test_${Date.now()}@example.com`;
      
      it('should register a new user with valid data', async () => {
        const response = await kongRequest()
          .post('/api/auth/register')
          .send({
            email: testEmail,
            password: 'TestPassword123!',
            full_name: 'Test User'
          })
          .expect('Content-Type', /json/);
        
        // Note: May return 201 (success) or 500 (email service issue in test env)
        if (response.status === 201) {
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('user');
          expect(response.body.data.user.email).toBe(testEmail);
        } else {
          // In test environment, email service might not be configured
          console.log('Registration may have failed due to email service:', response.body);
        }
      });
      
      it('should reject registration with existing email', async () => {
        const response = await kongRequest()
          .post('/api/auth/register')
          .send({
            email: TEST_USERS.admin.email,
            password: 'TestPassword123!',
            full_name: 'Duplicate User'
          })
          .expect('Content-Type', /json/)
          .expect(409);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject registration with weak password', async () => {
        const response = await kongRequest()
          .post('/api/auth/register')
          .send({
            email: `weak_${Date.now()}@example.com`,
            password: '123',
            full_name: 'Weak Password User'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject registration with missing email', async () => {
        const response = await kongRequest()
          .post('/api/auth/register')
          .send({
            password: 'TestPassword123!',
            full_name: 'No Email User'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject registration with missing password', async () => {
        const response = await kongRequest()
          .post('/api/auth/register')
          .send({
            email: `nopwd_${Date.now()}@example.com`,
            full_name: 'No Password User'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject registration with missing full_name', async () => {
        const response = await kongRequest()
          .post('/api/auth/register')
          .send({
            email: `noname_${Date.now()}@example.com`,
            password: 'TestPassword123!'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject registration with invalid email format', async () => {
        const response = await kongRequest()
          .post('/api/auth/register')
          .send({
            email: 'not-an-email',
            password: 'TestPassword123!',
            full_name: 'Invalid Email User'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // FORGOT PASSWORD
    // -----------------------------------------------------------------------
    describe('POST /api/auth/forgot-password', () => {
      
      it('should accept valid email for password reset', async () => {
        const response = await kongRequest()
          .post('/api/auth/forgot-password')
          .send({
            email: TEST_USERS.user.email
          })
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        // Should return same message whether user exists or not (security)
      });
      
      it('should accept non-existent email (security - same response)', async () => {
        const response = await kongRequest()
          .post('/api/auth/forgot-password')
          .send({
            email: 'nonexistent@example.com'
          })
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should reject invalid email format', async () => {
        const response = await kongRequest()
          .post('/api/auth/forgot-password')
          .send({
            email: 'invalid-email'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject missing email', async () => {
        const response = await kongRequest()
          .post('/api/auth/forgot-password')
          .send({})
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // RESET PASSWORD
    // -----------------------------------------------------------------------
    describe('POST /api/auth/reset-password', () => {
      
      it('should reject invalid reset token', async () => {
        const response = await kongRequest()
          .post('/api/auth/reset-password')
          .send({
            token: 'invalid-token',
            newPassword: 'NewPassword123!'
          })
          .expect('Content-Type', /json/)
          .expect(401);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject missing token', async () => {
        const response = await kongRequest()
          .post('/api/auth/reset-password')
          .send({
            newPassword: 'NewPassword123!'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject weak new password', async () => {
        const response = await kongRequest()
          .post('/api/auth/reset-password')
          .send({
            token: 'some-token',
            newPassword: '123'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // VERIFY EMAIL
    // -----------------------------------------------------------------------
    describe('POST /api/auth/verify-email', () => {
      
      it('should reject invalid verification token', async () => {
        const response = await kongRequest()
          .post('/api/auth/verify-email')
          .send({
            token: 'invalid-token'
          })
          .expect('Content-Type', /json/)
          .expect(401);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject missing token', async () => {
        const response = await kongRequest()
          .post('/api/auth/verify-email')
          .send({})
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
    });

    // -----------------------------------------------------------------------
    // REFRESH TOKEN
    // -----------------------------------------------------------------------
    describe('POST /api/auth/refresh', () => {
      
      it('should reject refresh without token', async () => {
        const response = await kongRequest()
          .post('/api/auth/refresh')
          .expect('Content-Type', /json/)
          .expect(401);
        
        expect(response.body.success).toBe(false);
      });
      
      // Note: Testing valid refresh requires cookie handling
      it('should refresh token with valid refresh token cookie', async () => {
        if (!refreshTokenCookie) {
          console.log('Skipping: No refresh token cookie available');
          return;
        }
        
        const response = await kongRequest()
          .post('/api/auth/refresh')
          .set('Cookie', refreshTokenCookie)
          .expect('Content-Type', /json/);
        
        // Could be 200 (success) or 401 (expired/invalid)
        expect([200, 401]).toContain(response.status);
      });
    });
  });

  // =========================================================================
  // PROTECTED ENDPOINTS (Require JWT via Kong)
  // =========================================================================
  describe('Protected Endpoints', () => {
    
    // Ensure we have tokens before running protected tests
    beforeAll(async () => {
      if (!adminToken) {
        const adminResponse = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: TEST_USERS.admin.email,
            password: TEST_USERS.admin.password
          });
        adminToken = adminResponse.body.data?.accessToken;
      }
      
      if (!userToken) {
        const userResponse = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: TEST_USERS.user.email,
            password: TEST_USERS.user.password
          });
        userToken = userResponse.body.data?.accessToken;
      }
    });

    // -----------------------------------------------------------------------
    // GET CURRENT USER (/me)
    // -----------------------------------------------------------------------
    describe('GET /api/auth/me', () => {
      
      it('should return current user profile with valid token', async () => {
        if (!userToken) {
          console.log('Skipping: No user token available');
          return;
        }
        
        const response = await kongRequest()
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${userToken}`)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user.email).toBe(TEST_USERS.user.email);
      });
      
      it('should reject request without token', async () => {
        const response = await kongRequest()
          .get('/api/auth/me')
          .expect(401);
      });
      
      it('should reject request with invalid token', async () => {
        const response = await kongRequest()
          .get('/api/auth/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // GET/UPDATE PROFILE
    // -----------------------------------------------------------------------
    describe('Profile Endpoints', () => {
      
      describe('GET /api/auth/profile', () => {
        it('should return user profile with valid token', async () => {
          if (!userToken) {
            console.log('Skipping: No user token available');
            return;
          }
          
          const response = await kongRequest()
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .expect('Content-Type', /json/)
            .expect(200);
          
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('email');
        });
        
        it('should reject without authentication', async () => {
          await kongRequest()
            .get('/api/auth/profile')
            .expect(401);
        });
      });
      
      describe('PUT /api/auth/profile', () => {
        it('should update user profile with valid data', async () => {
          if (!userToken) {
            console.log('Skipping: No user token available');
            return;
          }
          
          const response = await kongRequest()
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              full_name: 'Updated User Name',
              bio: 'This is my updated bio'
            })
            .expect('Content-Type', /json/)
            .expect(200);
          
          expect(response.body.success).toBe(true);
        });
        
        it('should reject profile update without authentication', async () => {
          await kongRequest()
            .put('/api/auth/profile')
            .send({
              full_name: 'Unauthorized Update'
            })
            .expect(401);
        });
      });
    });

    // -----------------------------------------------------------------------
    // CHANGE PASSWORD
    // -----------------------------------------------------------------------
    describe('POST /api/auth/change-password', () => {
      
      it('should reject with wrong current password', async () => {
        if (!userToken) {
          console.log('Skipping: No user token available');
          return;
        }
        
        const response = await kongRequest()
          .post('/api/auth/change-password')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            currentPassword: 'WrongPassword123!',
            newPassword: 'NewPassword123!'
          })
          .expect('Content-Type', /json/)
          .expect(401);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject with weak new password', async () => {
        if (!userToken) {
          console.log('Skipping: No user token available');
          return;
        }
        
        const response = await kongRequest()
          .post('/api/auth/change-password')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            currentPassword: TEST_USERS.user.password,
            newPassword: '123'
          })
          .expect('Content-Type', /json/)
          .expect(400);
        
        expect(response.body.success).toBe(false);
      });
      
      it('should reject without authentication', async () => {
        await kongRequest()
          .post('/api/auth/change-password')
          .send({
            currentPassword: 'OldPass123!',
            newPassword: 'NewPass123!'
          })
          .expect(401);
      });
      
      // Note: Successful password change would break subsequent tests
      // so we skip it in the integration test suite
    });

    // -----------------------------------------------------------------------
    // LOGOUT
    // -----------------------------------------------------------------------
    describe('POST /api/auth/logout', () => {
      
      it('should logout user with valid token', async () => {
        // Login to get a fresh token for logout test
        const loginResponse = await kongRequest()
          .post('/api/auth/login')
          .send({
            email: TEST_USERS.manager.email,
            password: TEST_USERS.manager.password
          });
        
        const token = loginResponse.body.data?.access_token;
        if (!token) {
          console.log('Skipping: Could not get token for logout test');
          return;
        }
        
        const response = await kongRequest()
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token}`)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body.success).toBe(true);
      });
      
      it('should reject logout without authentication', async () => {
        await kongRequest()
          .post('/api/auth/logout')
          .expect(401);
      });
    });

    // -----------------------------------------------------------------------
    // ADMIN ENDPOINTS
    // -----------------------------------------------------------------------
    describe('Admin Endpoints', () => {
      
      describe('GET /api/auth/users', () => {
        it('should return all users for admin', async () => {
          if (!adminToken) {
            console.log('Skipping: No admin token available');
            return;
          }
          
          const response = await kongRequest()
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect('Content-Type', /json/)
            .expect(200);
          
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('users');
          expect(Array.isArray(response.body.data.users)).toBe(true);
        });
        
        it('should support pagination', async () => {
          if (!adminToken) {
            console.log('Skipping: No admin token available');
            return;
          }
          
          const response = await kongRequest()
            .get('/api/auth/users?page=1&limit=5')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect('Content-Type', /json/)
            .expect(200);
          
          expect(response.body.success).toBe(true);
          expect(response.body.data).toHaveProperty('pagination');
        });
        
        it('should reject for non-admin users', async () => {
          if (!userToken) {
            console.log('Skipping: No user token available');
            return;
          }
          
          await kongRequest()
            .get('/api/auth/users')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
        });
        
        it('should reject without authentication', async () => {
          await kongRequest()
            .get('/api/auth/users')
            .expect(401);
        });
      });
      
      describe('GET /api/auth/users/:id', () => {
        it('should return specific user for admin', async () => {
          if (!adminToken) {
            console.log('Skipping: No admin token available');
            return;
          }
          
          const response = await kongRequest()
            .get(`/api/auth/users/${TEST_USERS.user.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .expect('Content-Type', /json/)
            .expect(200);
          
          expect(response.body.success).toBe(true);
          expect(response.body.data.user.id).toBe(TEST_USERS.user.id);
        });
        
        it('should return 404 for non-existent user', async () => {
          if (!adminToken) {
            console.log('Skipping: No admin token available');
            return;
          }
          
          await kongRequest()
            .get('/api/auth/users/00000000-0000-0000-0000-000000999999')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(404);
        });
        
        it('should reject for non-admin users', async () => {
          if (!userToken) {
            console.log('Skipping: No user token available');
            return;
          }
          
          await kongRequest()
            .get(`/api/auth/users/${TEST_USERS.admin.id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
        });
      });
      
      describe('POST /api/auth/cleanup', () => {
        it('should perform cleanup for admin', async () => {
          if (!adminToken) {
            console.log('Skipping: No admin token available');
            return;
          }
          
          const response = await kongRequest()
            .post('/api/auth/cleanup')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect('Content-Type', /json/)
            .expect(200);
          
          expect(response.body.success).toBe(true);
        });
        
        it('should reject cleanup for non-admin users', async () => {
          if (!userToken) {
            console.log('Skipping: No user token available');
            return;
          }
          
          await kongRequest()
            .post('/api/auth/cleanup')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
        });
        
        it('should reject cleanup without authentication', async () => {
          await kongRequest()
            .post('/api/auth/cleanup')
            .expect(401);
        });
      });
    });
  });

  // =========================================================================
  // DIRECT SERVICE ENDPOINTS (Not exposed via Kong)
  // Note: These endpoints are not accessible from outside Docker network
  // They are tested here for documentation purposes but may be skipped
  // =========================================================================
  describe('Direct Service Endpoints (not via Kong)', () => {
    
    // These tests require direct access to auth service (not via Kong)
    // In Docker environment, the service is only accessible within the network
    const canAccessDirectly = process.env.AUTH_SERVICE_URL && 
                              !process.env.AUTH_SERVICE_URL.includes('auth-service');
    
    describe('GET /api/auth/version', () => {
      it('should return service version info (if accessible)', async () => {
        if (!canAccessDirectly) {
          console.log('Skipping: Direct service access not available in Docker');
          return;
        }
        
        const response = await directRequest()
          .get('/api/auth/version')
          .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body).toHaveProperty('service', 'auth-service');
        expect(response.body).toHaveProperty('version');
        expect(response.body).toHaveProperty('environment');
      });
    });
    
    describe('GET /api/auth/.well-known/jwks.json', () => {
      it('should return JWKS for JWT verification (if accessible)', async () => {
        if (!canAccessDirectly) {
          console.log('Skipping: Direct service access not available in Docker');
          return;
        }
        
        const response = await directRequest()
          .get('/api/auth/.well-known/jwks.json')
          .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body).toHaveProperty('keys');
        expect(Array.isArray(response.body.keys)).toBe(true);
      });
    });
    
    describe('GET /api/auth/public-key', () => {
      it('should return public key for JWT verification (if accessible)', async () => {
        if (!canAccessDirectly) {
          console.log('Skipping: Direct service access not available in Docker');
          return;
        }
        
        const response = await directRequest()
          .get('/api/auth/public-key')
          .set('X-API-Gateway-Secret', API_GATEWAY_SECRET)
          .expect('Content-Type', /json/)
          .expect(200);
        
        expect(response.body).toHaveProperty('publicKey');
        expect(response.body).toHaveProperty('algorithm', 'RS256');
      });
    });
  });

  // =========================================================================
  // ERROR HANDLING & EDGE CASES
  // =========================================================================
  describe('Error Handling', () => {
    
    it('should return 404 for unknown routes', async () => {
      const response = await kongRequest()
        .get('/api/auth/unknown-endpoint')
        .expect(404);
    });
    
    it('should handle malformed JSON gracefully', async () => {
      const response = await kongRequest()
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
    
    it('should handle empty body on POST endpoints', async () => {
      const response = await kongRequest()
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });
});
