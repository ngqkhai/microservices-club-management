const logger = require('../utils/logger');

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Request error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method 
  });
  
  // Handle MongoDB duplicate key error
  if (err.name === 'MongoServerError' && err.code === 11000) {
    res.status(409).json({
      status: 409,
      error: 'DUPLICATE_ENTITY',
      message: 'A club with this name already exists',
      field: Object.keys(err.keyPattern || {})[0] || 'unknown'
    });
  }
  // Handle MongoDB validation errors
  else if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
    
    res.status(400).json({
      status: 400,
      error: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: validationErrors
    });
  }
  // Handle invalid ObjectId format
  else if (err.name === 'CastError' && err.kind === 'ObjectId') {
    res.status(400).json({
      status: 400,
      error: 'INVALID_ID_FORMAT',
      message: 'Invalid ID format provided'
    });
  }
  else {
    res.status(err.status || 500).json({
      status: err.status || 500,
      error: err.name || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred'
    });
  }
};

module.exports = {
  errorHandler
};
