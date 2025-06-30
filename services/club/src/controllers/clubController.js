const Club = require('../models/club');

class ClubController {
  /**
   * Get all clubs with filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getClubs(req, res, next) {
    try {
      const { name, type, status, page, limit } = req.query;
      
      const clubs = await Club.findAll({
        name,
        type,
        status,
        page,
        limit
      });
      
      res.status(200).json(clubs);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get a club by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getClubById(req, res, next) {
    try {
      const { id } = req.params;
      const club = await Club.findById(id);
      
      if (!club) {
        const error = new Error('Club not found');
        error.status = 404;
        error.name = 'CLUB_NOT_FOUND';
        throw error;
      }
      
      // Return club details according to US-007 spec
      res.status(200).json({
        id: club.id,
        name: club.name,
        description: club.description,
        type: club.type,
        size: club.size || 0,
        logo_url: club.logo_url,
        website_url: club.website_url,
        status: club.status
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Create a new club
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createClub(req, res, next) {
    try {
      const { name, description, type, logo_url } = req.body;
      
      // Validate required fields
      if (!name || !type) {
        const error = new Error('Name and type are required');
        error.status = 400;
        error.name = 'VALIDATION_ERROR';
        throw error;
      }
      
      // Get user ID from JWT token (assuming it's set by auth middleware)
      const created_by = req.user?.id;
      
      // Handle missing created_by in development mode
      let effectiveCreatedBy = created_by;
      if (!effectiveCreatedBy && (process.env.NODE_ENV === 'development' || process.env.MOCK_DB === 'true')) {
        // If there's a created_by in request body, use it for testing
        effectiveCreatedBy = req.body.created_by || '60d0fe4f5311236168a109ca';
        console.warn('⚠️ Using test user ID for created_by:', effectiveCreatedBy);
      }
      
      // Create club with correct status enum value and created_by
      const newClub = await Club.create({
        name,
        description,
        type,
        status: 'ACTIVE', // Use uppercase as defined in enum
        logo_url,
        website_url: req.body.website_url,
        created_by: effectiveCreatedBy
      });
      
      res.status(201).json(newClub);
    } catch (error) {
      // Handle MongoDB duplicate key error (code 11000) for club name uniqueness
      if (error.name === 'MongoServerError' && error.code === 11000) {
        const duplicateError = new Error('Club with this name already exists');
        duplicateError.status = 409; // Conflict
        duplicateError.name = 'DUPLICATE_ENTITY'; // Match the name in errorMiddleware
        next(duplicateError);
      } else {
        next(error);
      }
    }
  }
  
  /**
   * Get all recruitment rounds for a specific club
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getClubRecruitments(req, res, next) {
    try {
      const { id } = req.params;
      
      // First, verify that the club exists
      const club = await Club.findById(id);
      if (!club) {
        const error = new Error('Club not found');
        error.status = 404;
        error.name = 'CLUB_NOT_FOUND';
        throw error;
      }
      
      // Get all recruitment rounds for this club
      const recruitments = await Club.findRecruitments(id);
      
      // Format the response according to the API spec
      const formattedRecruitments = recruitments.map(recruitment => ({
        id: recruitment.id,
        title: recruitment.title,
        start_at: recruitment.start_at,
        status: recruitment.status
      }));
      
      res.status(200).json(formattedRecruitments);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ClubController();
