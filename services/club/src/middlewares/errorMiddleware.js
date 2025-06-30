/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle MongoDB duplicate key error
  if (err.name === 'MongoServerError' && err.code === 11000) {
    res.status(409).json({
      status: 409,
      error: 'DUPLICATE_ENTITY',
      message: 'A club with this name already exists',
      field: Object.keys(err.keyPattern || {})[0] || 'unknown'
    });
  } else {
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
