/**
 * Shared Authentication Middleware for Kong API Gateway
 * 
 * This middleware extracts user information from headers injected by Kong API Gateway
 * after JWT verification. Services no longer need to verify JWT tokens themselves.
 * 
 * Headers injected by Kong:
 * - x-user-id: User ID from JWT payload
 * - x-user-email: User email from JWT payload  
 * - x-user-role: User role from JWT payload
 */

const logger = require('../utils/logger');

/**
 * Authentication middleware that extracts user info from Kong-injected headers
 */
const authMiddleware = (req, res, next) => {
  try {
    // Extract user information from Kong-injected headers
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    const userRole = req.headers['x-user-role'];

    // Validate that all required headers are present
    if (!userId || !userEmail || !userRole) {
      logger.warn('Missing user headers from API Gateway', {
        headers: {
          'x-user-id': userId ? 'present' : 'missing',
          'x-user-email': userEmail ? 'present' : 'missing',
          'x-user-role': userRole ? 'present' : 'missing'
        },
        path: req.path,
        method: req.method
      });
      
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Validate user role
    const validRoles = ['USER', 'ADMIN'];
    if (!validRoles.includes(userRole)) {
      logger.warn('Invalid user role from API Gateway', {
        userId,
        userRole,
        path: req.path,
        method: req.method
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid user role',
        code: 'INVALID_ROLE'
      });
    }

    // Attach user information to request object
    req.user = {
      id: userId,
      email: userEmail,
      role: userRole
    };

    logger.debug('User authenticated via API Gateway', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Role-based authorization middleware factory
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient role', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
const requireAdmin = requireRole('ADMIN');

/**
 * Middleware to require user role (or admin)
 */
const requireUser = requireRole(['USER', 'ADMIN']);

/**
 * Optional authentication middleware - doesn't fail if no user headers
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
const optionalAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];

  if (userId && userEmail && userRole) {
    req.user = {
      id: userId,
      email: userEmail,
      role: userRole
    };
  }

  next();
};

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireUser,
  optionalAuth
}; 