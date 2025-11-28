// Base error class
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.code = code;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

// Authentication errors
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', code = 'AUTH_FAILED') {
    super(message, 401, code);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions', code = 'INSUFFICIENT_PERMISSIONS') {
    super(message, 403, code);
  }
}

class TokenError extends AppError {
  constructor(message = 'Invalid or expired token', code = 'INVALID_TOKEN') {
    super(message, 401, code);
  }
}

// Validation errors
class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = [], code = 'VALIDATION_ERROR') {
    super(message, 400, code);
    this.details = details;
  }
}

// Resource errors
class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'RESOURCE_NOT_FOUND') {
    super(message, 404, code);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code = 'RESOURCE_CONFLICT') {
    super(message, 409, code);
  }
}

// Rate limiting error
class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', code = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, code);
  }
}

// Database errors
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', code = 'DATABASE_ERROR') {
    super(message, 500, code);
  }
}

// External service errors
class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable', code = 'EXTERNAL_SERVICE_ERROR') {
    super(message, 503, code);
  }
}

// Specific auth-related errors
class InvalidCredentialsError extends AuthenticationError {
  constructor(message = 'Invalid email or password') {
    super(message, 'INVALID_CREDENTIALS');
  }
}

class AccountLockedError extends AuthenticationError {
  constructor(message = 'Account is temporarily locked due to too many failed login attempts') {
    super(message, 'ACCOUNT_LOCKED');
  }
}

class EmailNotVerifiedError extends AuthenticationError {
  constructor(message = 'Email address not verified') {
    super(message, 'EMAIL_NOT_VERIFIED');
  }
}

class RefreshTokenExpiredError extends TokenError {
  constructor(message = 'Refresh token has expired') {
    super(message, 'REFRESH_TOKEN_EXPIRED');
  }
}

class PasswordResetTokenInvalidError extends TokenError {
  constructor(message = 'Password reset token is invalid or expired') {
    super(message, 'PASSWORD_RESET_TOKEN_INVALID');
  }
}

class EmailVerificationTokenError extends TokenError {
  constructor(message = 'Email verification token is invalid or expired') {
    super(message, 'EMAIL_VERIFICATION_TOKEN_INVALID');
  }
}

class EmailAlreadyExistsError extends ConflictError {
  constructor(message = 'Email address is already registered') {
    super(message, 'EMAIL_ALREADY_EXISTS');
  }
}

class WeakPasswordError extends ValidationError {
  constructor(message = 'Password does not meet security requirements') {
    super(message, [], 'WEAK_PASSWORD');
  }
}

// Error factory function
const createError = (type, message, code, statusCode) => {
  switch (type) {
    case 'AUTH':
      return new AuthenticationError(message, code);
    case 'AUTHZ':
      return new AuthorizationError(message, code);
    case 'TOKEN':
      return new TokenError(message, code);
    case 'VALIDATION':
      return new ValidationError(message, [], code);
    case 'NOT_FOUND':
      return new NotFoundError(message, code);
    case 'CONFLICT':
      return new ConflictError(message, code);
    case 'RATE_LIMIT':
      return new TooManyRequestsError(message, code);
    case 'DATABASE':
      return new DatabaseError(message, code);
    case 'EXTERNAL_SERVICE':
      return new ExternalServiceError(message, code);
    default:
      return new AppError(message, statusCode || 500, code);
  }
};

// Error response formatter
const formatErrorResponse = (error, includeStack = false) => {
  const response = {
    success: false,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp || new Date().toISOString()
  };

  if (error.details && error.details.length > 0) {
    response.details = error.details;
  }

  if (includeStack && error.stack) {
    response.stack = error.stack;
  }

  return response;
};

// Check if error is operational (expected)
const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

// Handle Sequelize errors
const handleSequelizeError = (error) => {
  if (error.name === 'SequelizeValidationError') {
    const details = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return new ValidationError('Database validation failed', details, 'SEQUELIZE_VALIDATION_ERROR');
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'unknown';
    if (field === 'email') {
      return new EmailAlreadyExistsError();
    }
    return new ConflictError(`${field} already exists`, 'UNIQUE_CONSTRAINT_ERROR');
  }

  if (error.name === 'SequelizeDatabaseError') {
    return new DatabaseError('Database operation failed', 'DATABASE_OPERATION_ERROR');
  }

  if (error.name === 'SequelizeConnectionError') {
    return new DatabaseError('Database connection failed', 'DATABASE_CONNECTION_ERROR');
  }

  return new DatabaseError(error.message, 'UNKNOWN_DATABASE_ERROR');
};

module.exports = {
  // Base classes
  AppError,

  // Specific error classes
  AuthenticationError,
  AuthorizationError,
  TokenError,
  ValidationError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  DatabaseError,
  ExternalServiceError,

  // Auth-specific errors
  InvalidCredentialsError,
  AccountLockedError,
  EmailNotVerifiedError,
  RefreshTokenExpiredError,
  PasswordResetTokenInvalidError,
  EmailVerificationTokenError,
  EmailAlreadyExistsError,
  WeakPasswordError,

  // Utility functions
  createError,
  formatErrorResponse,
  isOperationalError,
  handleSequelizeError
};