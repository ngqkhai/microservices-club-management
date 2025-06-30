const request = require('supertest');
const Application = require('../src/app');
const { User, RefreshToken } = require('../src/models');

describe('Auth Service Integration Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    const application = new Application();
    app = application.getApp();
    await application.initialize();
  });

  afterEach(async () => {
    // Clean up database after each test
    await RefreshToken.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      full_name: 'Test User',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.full_name).toBe(validUserData.full_name);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          password: 'weak',
          confirmPassword: 'weak'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 409 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    const userData = {
      email: 'test@example.com',
      full_name: 'Test User',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };

    beforeEach(async () => {
      // Create a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should handle forgot password request', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset link has been sent');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/auth/health')
        .expect(200);

      expect(response.body.status).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.services).toBeDefined();
    });
  });

  describe('GET /api/auth/liveness', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/api/auth/liveness')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('alive');
    });
  });

  describe('GET /api/auth/readiness', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/auth/readiness')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('ready');
    });
  });

  describe('Protected Routes', () => {
    const mockGatewayHeaders = {
      'x-user-id': '123e4567-e89b-12d3-a456-426614174000',
      'x-user-role': 'USER',
      'x-gateway-secret': process.env.API_GATEWAY_SECRET || 'test-secret'
    };

    describe('GET /api/auth/me', () => {
      it('should require gateway headers', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should return 404 for non-existent user with valid headers', async () => {
        const response = await request(app)
          .get('/api/auth/me')
          .set(mockGatewayHeaders)
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/auth/logout', () => {
      it('should handle logout without refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/logout')
          .set(mockGatewayHeaders)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Logged out successfully');
      });
    });
  });
}); 