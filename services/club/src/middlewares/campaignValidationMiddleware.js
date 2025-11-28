/**
 * Middleware for recruitment campaign validation and error handling
 */

const { CreateCampaignDTO, UpdateCampaignDTO } = require('../dtos/recruitmentCampaignDTOs');

class CampaignValidationMiddleware {

  /**
   * Validate create campaign request
   */
  static validateCreateCampaign(req, res, next) {
    try {
      const campaignDTO = new CreateCampaignDTO(req.body);
      const validation = campaignDTO.validate();

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Attach validated DTO to request
      req.validatedData = campaignDTO;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
        error: error.message
      });
    }
  }

  /**
   * Validate update campaign request
   */
  static validateUpdateCampaign(req, res, next) {
    try {
      const updateDTO = new UpdateCampaignDTO(req.body);
      const validation = updateDTO.validate();

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Attach validated DTO to request
      req.validatedData = updateDTO;
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid request data',
        error: error.message
      });
    }
  }

  /**
   * Validate campaign ID parameter
   */
  static validateCampaignId(req, res, next) {
    const { campaignId } = req.params;

    if (!campaignId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID is required'
      });
    }

    // Basic MongoDB ObjectId validation
    if (!/^[0-9a-fA-F]{24}$/.test(campaignId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid campaign ID format'
      });
    }

    next();
  }

  /**
   * Validate club ID parameter
   */
  static validateClubId(req, res, next) {
    const { clubId } = req.params;

    if (!clubId) {
      return res.status(400).json({
        success: false,
        message: 'Club ID is required'
      });
    }

    // Basic MongoDB ObjectId validation
    if (!/^[0-9a-fA-F]{24}$/.test(clubId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid club ID format'
      });
    }

    next();
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(req, res, next) {
    const { page, limit } = req.query;

    if (page && (isNaN(page) || parseInt(page) < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer'
      });
    }

    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a positive integer between 1 and 100'
      });
    }

    next();
  }

  /**
   * Validate status parameter
   */
  static validateStatus(req, res, next) {
    const { status } = req.query;

    if (status && !['draft', 'active', 'paused', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: draft, active, paused, completed, cancelled'
      });
    }

    next();
  }

  /**
   * Validate sort parameter
   */
  static validateSort(req, res, next) {
    const { sort } = req.query;

    if (sort && !['title', 'start_date', 'end_date', 'created_at'].includes(sort)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort field. Must be one of: title, start_date, end_date, created_at'
      });
    }

    next();
  }

  /**
   * Generic error handler for campaign operations
   */
  static handleErrors(error, req, res, _next) {
    // eslint-disable-next-line no-console
    console.error('Campaign operation error:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error'
      });
    }

    // Permission errors
    if (error.message.includes('permission')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    // Not found errors
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Default error response
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = CampaignValidationMiddleware;
