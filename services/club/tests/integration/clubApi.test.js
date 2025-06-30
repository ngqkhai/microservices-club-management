const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { extractUserFromHeaders } = require('../../src/middlewares/authMiddleware');
const clubRoutes = require('../../src/routes/clubRoutes');
const { Club } = require('../../src/config/database');

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(extractUserFromHeaders);
app.use('/api', clubRoutes);

// Error handling middleware
const { errorHandler } = require('../../src/middlewares/errorMiddleware');
app.use(errorHandler);

// Add a better error handler for tests
app.use((err, req, res, next) => {
  console.error('Unhandled test error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'UNKNOWN_ERROR',
    message: err.message || 'Internal server error'
  });
});

describe('Club API Integration Tests', () => {
  let testClubId;
  const userId = new mongoose.Types.ObjectId();
  
  // Create test data before each test to ensure it's available
  beforeEach(async () => {
    // Clear any existing clubs first
    await Club.deleteMany({});
    
    // Create a test club
    const testClub = new Club({
      name: 'Integration Test Club',
      description: 'Club for integration testing',
      type: 'ACADEMIC',
      status: 'ACTIVE',
      created_by: userId
    });
    
    await testClub.save();
    testClubId = testClub._id.toString(); // Store ID as string to avoid ObjectId comparison issues
  });
  
  describe('GET /api/clubs', () => {
    test('should return all clubs', async () => {
      const response = await request(app)
        .get('/api/clubs')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('results');
      expect(response.body.results.length).toBeGreaterThan(0);
    });
    
    test('should filter clubs by name', async () => {
      // First make sure the test club exists
      const allClubs = await request(app)
        .get('/api/clubs')
        .expect(200);
      
      // Verify the test data exists
      const testClubExists = allClubs.body.results.some(club => club.name === 'Integration Test Club');
      expect(testClubExists).toBe(true);
      
      // Now test filtering
      const response = await request(app)
        .get('/api/clubs?name=Integration')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.total).toBe(1);
      expect(response.body.results[0].name).toBe('Integration Test Club');
    });
  });
  
  describe('GET /api/clubs/:id', () => {
    test('should return a club by ID', async () => {
      // First check if the clubs exists by getting all clubs
      const allClubs = await request(app)
        .get('/api/clubs')
        .expect(200);
      
      // Find our test club in the results and get its actual ID
      const clubInDb = allClubs.body.results.find(c => c.name === 'Integration Test Club');
      expect(clubInDb).toBeDefined();
      
      // Use that id to fetch the specific club
      const response = await request(app)
        .get(`/api/clubs/${clubInDb.id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Integration Test Club');
      expect(response.body.type).toBe('ACADEMIC');
    });
    
    test('should return 404 for non-existent club', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/clubs/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.error).toBe('CLUB_NOT_FOUND');
    });
  });
  
  describe('POST /api/clubs', () => {
    test('should create a new club', async () => {
      const newClubData = {
        name: 'New Integration Club',
        description: 'New club for integration testing',
        type: 'SPORTS',
        logo_url: 'http://example.com/logo.png'
      };
      
      // Mock user authentication
      const response = await request(app)
        .post('/api/clubs')
        .set('x-user-id', userId.toString())
        .set('x-user-roles', 'ADMIN,USER')
        .send(newClubData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newClubData.name);
      expect(response.body.description).toBe(newClubData.description);
      expect(response.body.type).toBe(newClubData.type);
    });
    
    test('should return 400 for missing required fields', async () => {
      const invalidData = {
        description: 'Missing name and type'
      };
      
      const response = await request(app)
        .post('/api/clubs')
        .set('x-user-id', userId.toString())
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });
    
    test('should return 409 for duplicate club name', async () => {
      // We'll test this by directly creating two clubs with the same name using the model
      // to ensure we properly trigger the MongoDB duplicate key error
      
      const duplicateData = {
        name: 'Duplicate Name Test',
        description: 'Creating a club that will be duplicated',
        type: 'ACADEMIC',
        created_by: userId
      };
      
      // First, create a club directly through the model
      const originalClub = new Club(duplicateData);
      await originalClub.save();
      
      // Now try to create another one through the API
      const response = await request(app)
        .post('/api/clubs')
        .set('x-user-id', userId.toString())
        .set('x-user-roles', 'ADMIN,USER')
        .send(duplicateData)
        .expect(409);
        
      expect(response.body.error).toBe('DUPLICATE_ENTITY');
    });
  });
  
  describe('GET /api/clubs/:id/recruitments', () => {
    test('should return recruitments for a club', async () => {
      // First verify that the club exists
      const clubResponse = await request(app)
        .get(`/api/clubs/${testClubId}`)
        .expect(200);
      
      expect(clubResponse.body.id).toBe(testClubId);
      
      // Now test recruitments endpoint
      const response = await request(app)
        .get(`/api/clubs/${testClubId}/recruitments`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Expect an array of recruitments (even if empty)
      expect(Array.isArray(response.body)).toBe(true);
    });
    
    test('should return 404 for non-existent club', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/clubs/${nonExistentId}/recruitments`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body.error).toBe('CLUB_NOT_FOUND');
    });
  });
});
