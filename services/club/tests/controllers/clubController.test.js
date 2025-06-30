const mongoose = require('mongoose');
const clubController = require('../../src/controllers/clubController');
const Club = require('../../src/models/club');

// Mock the Club model methods
jest.mock('../../src/models/club');

describe('Club Controller', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClubs', () => {
    test('should return all clubs with 200 status code', async () => {
      // Mock data
      const mockClubs = {
        total: 2,
        results: [
          { id: '1', name: 'Club 1', type: 'ACADEMIC', status: 'ACTIVE' },
          { id: '2', name: 'Club 2', type: 'SPORTS', status: 'INACTIVE' }
        ]
      };

      // Mock the findAll method
      Club.findAll.mockResolvedValue(mockClubs);

      // Mock Express request and response
      const req = {
        query: {}
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.getClubs(req, res, next);

      // Assert
      expect(Club.findAll).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClubs);
      expect(next).not.toHaveBeenCalled();
    });

    test('should pass filters to model', async () => {
      // Mock data
      const mockFilters = {
        name: 'test',
        type: 'ACADEMIC',
        status: 'ACTIVE',
        page: '2',
        limit: '10'
      };

      // Mock the findAll method
      Club.findAll.mockResolvedValue({ total: 0, results: [] });

      // Mock Express request and response
      const req = {
        query: mockFilters
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.getClubs(req, res, next);

      // Assert
      expect(Club.findAll).toHaveBeenCalledWith(mockFilters);
    });

    test('should handle errors with next', async () => {
      // Mock error
      const mockError = new Error('Database error');
      Club.findAll.mockRejectedValue(mockError);

      // Mock Express request and response
      const req = { query: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Call the controller method
      await clubController.getClubs(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getClubById', () => {
    test('should return a club with 200 status code when found', async () => {
      // Mock data
      const mockClub = {
        id: '123',
        name: 'Test Club',
        description: 'Test Description',
        type: 'ACADEMIC',
        size: 10,
        logo_url: 'http://example.com/logo.png',
        website_url: 'http://example.com',
        status: 'ACTIVE'
      };

      // Mock the findById method
      Club.findById.mockResolvedValue(mockClub);

      // Mock Express request and response
      const req = {
        params: { id: '123' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.getClubById(req, res, next);

      // Assert
      expect(Club.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockClub);
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 404 when club not found', async () => {
      // Mock the findById method to return null
      Club.findById.mockResolvedValue(null);

      // Mock Express request and response
      const req = {
        params: { id: 'nonexistent' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.getClubById(req, res, next);

      // Assert
      expect(Club.findById).toHaveBeenCalledWith('nonexistent');
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toMatchObject({
        status: 404,
        name: 'CLUB_NOT_FOUND',
        message: 'Club not found'
      });
    });

    test('should handle errors with next', async () => {
      // Mock error
      const mockError = new Error('Database error');
      Club.findById.mockRejectedValue(mockError);

      // Mock Express request and response
      const req = {
        params: { id: '123' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Call the controller method
      await clubController.getClubById(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createClub', () => {
    test('should create a club with 201 status code', async () => {
      // Mock data
      const mockClubData = {
        name: 'New Club',
        description: 'New club description',
        type: 'ACADEMIC',
        logo_url: 'http://example.com/logo.png'
      };

      const mockCreatedClub = {
        id: '123',
        ...mockClubData,
        status: 'ACTIVE',
        created_by: 'user123'
      };

      // Mock the create method
      Club.create.mockResolvedValue(mockCreatedClub);

      // Mock Express request and response
      const req = {
        body: mockClubData,
        user: { id: 'user123' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.createClub(req, res, next);

      // Assert
      expect(Club.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedClub);
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle validation error when name or type is missing', async () => {
      // Mock data without name
      const invalidData = {
        description: 'Club description',
        type: 'ACADEMIC'
      };

      // Mock Express request and response
      const req = {
        body: invalidData,
        user: { id: 'user123' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.createClub(req, res, next);

      // Assert
      expect(Club.create).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toMatchObject({
        status: 400,
        name: 'VALIDATION_ERROR',
        message: 'Name and type are required'
      });
    });

    test('should handle duplicate club name error', async () => {
      // Mock data
      const mockClubData = {
        name: 'Existing Club',
        description: 'Club description',
        type: 'ACADEMIC'
      };

      // Mock MongoDB duplicate key error
      const duplicateError = new Error('Duplicate key error');
      duplicateError.name = 'MongoServerError';
      duplicateError.code = 11000;

      // Mock the create method to throw the error
      Club.create.mockRejectedValue(duplicateError);

      // Mock Express request and response
      const req = {
        body: mockClubData,
        user: { id: 'user123' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.createClub(req, res, next);

      // Assert
      expect(Club.create).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toMatchObject({
        status: 409,
        name: 'DUPLICATE_ENTITY',
        message: 'Club with this name already exists'
      });
    });
  });

  describe('getClubRecruitments', () => {
    test('should return recruitments with 200 status code', async () => {
      // Mock data
      const mockClub = { id: '123', name: 'Test Club' };
      const mockRecruitments = [
        { id: 'r1', title: 'Spring 2025', start_at: new Date(), status: 'OPEN' },
        { id: 'r2', title: 'Fall 2025', start_at: new Date(), status: 'CLOSED' }
      ];

      // Mock the methods
      Club.findById.mockResolvedValue(mockClub);
      Club.findRecruitments.mockResolvedValue(mockRecruitments);

      // Mock Express request and response
      const req = {
        params: { id: '123' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.getClubRecruitments(req, res, next);

      // Assert
      expect(Club.findById).toHaveBeenCalledWith('123');
      expect(Club.findRecruitments).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRecruitments);
    });

    test('should return 404 when club not found', async () => {
      // Mock findById to return null
      Club.findById.mockResolvedValue(null);

      // Mock Express request and response
      const req = {
        params: { id: 'nonexistent' }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      // Call the controller method
      await clubController.getClubRecruitments(req, res, next);

      // Assert
      expect(Club.findById).toHaveBeenCalledWith('nonexistent');
      expect(Club.findRecruitments).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toMatchObject({
        status: 404,
        name: 'CLUB_NOT_FOUND',
        message: 'Club not found'
      });
    });
  });
});
