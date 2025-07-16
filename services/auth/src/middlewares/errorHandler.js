const logger = require('../config/logger');
const { 
  AppError, 
  formatErrorResponse, 
  isOperationalError, 
  handleSequelizeError 
} = require('../utils/errors');

// Development error response
const sendErrorDev = (err, res) => {
  const errorResponse = formatErrorResponse(err, true);
  
  logger.error('Error details:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    code: err.code
  });

  res.status(err.statusCode || 500).json(errorResponse);
};

// Production error response
const sendErrorProd = (err, res) => {
  // Only send error details for operational errors
  if (isOperationalError(err)) {
    const errorResponse = formatErrorResponse(err, false);
    res.status(err.statusCode || 500).json(errorResponse);
  } else {
    // Don't leak error details to client in production
    logger.error('Unexpected error:', {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode
    });

    res.status(500).json({
      success: false,
      message: 'Something went wrong',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Handle different types of errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_DATA');
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400, 'DUPLICATE_FIELD');
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401, 'INVALID_JWT');

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again', 401, 'JWT_EXPIRED');

// Async error handler wrapper
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    // Handle Sequelize errors
    if (err.name && err.name.startsWith('Sequelize')) {
      error = handleSequelizeError(error);
    }

    sendErrorProd(error, res);
  }
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  const message = `Cannot find ${req.originalUrl} on this server`;
  const error = new AppError(message, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

// Request timeout handler
const timeoutHandler = (timeout = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      const error = new AppError('Request timeout', 408, 'REQUEST_TIMEOUT');
      next(error);
    }, timeout);

    // Clear timeout if response is sent
    res.on('finish', () => {
      clearTimeout(timer);
    });

    next();
  };
};

// Graceful shutdown handler
const gracefulShutdown = (server) => {
  return (signal) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);
    
    server.close((err) => {
      if (err) {
        logger.error('Error during graceful shutdown:', err);
        process.exit(1);
      }
      
      logger.info('Server closed gracefully');
      process.exit(0);
    });

    // Force close if graceful shutdown takes too long
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };
};

// Uncaught exception handler
const uncaughtExceptionHandler = (err) => {
  logger.error('Uncaught Exception! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  
  process.exit(1);
};

// Unhandled rejection handler
const unhandledRejectionHandler = (err) => {
  logger.error('Unhandled Rejection! Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  
  process.exit(1);
};

// Setup global error handlers
const setupGlobalErrorHandlers = (server) => {
  process.on('uncaughtException', uncaughtExceptionHandler);
  process.on('unhandledRejection', unhandledRejectionHandler);
  
  process.on('SIGTERM', gracefulShutdown(server));
  process.on('SIGINT', gracefulShutdown(server));
};

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  asyncErrorHandler,
  timeoutHandler,
  setupGlobalErrorHandlers,
  sendErrorDev,
  sendErrorProd
}; 