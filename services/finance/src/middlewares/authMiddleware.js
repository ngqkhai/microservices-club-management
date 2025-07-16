/**
 * Authentication middleware for Finance Service
 * Validates API Gateway secret header and extracts user information
 * REQUIRES trusted internal header validation first
 */

/**
 * Main authentication middleware that validates gateway secret and extracts user info
 */
const authMiddleware = (req, res, next) => {
  try {
    // MANDATORY: Validate API Gateway secret header first
    const gatewaySecret = req.headers['x-api-gateway-secret'];
    const expectedSecret = process.env.API_GATEWAY_SECRET || 'club-mgmt-internal-secret-2024';
    
    if (!gatewaySecret || gatewaySecret !== expectedSecret) {
      console.warn('FINANCE SERVICE: Request rejected - Invalid or missing gateway secret', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        hasSecret: !!gatewaySecret,
        timestamp: new Date().toISOString()
      });
      
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Request must come through API Gateway',
        code: 'INVALID_GATEWAY'
      });
    }

    console.debug('FINANCE SERVICE: Gateway validation passed', {
      path: req.path,
      method: req.method
    });

    // Extract user information from validated Kong-injected headers
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    const userRole = req.headers['x-user-role'];

    // Validate that all required headers are present
    if (!userId || !userEmail || !userRole) {
      console.warn('Missing user headers from API Gateway', {
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
      console.warn('Invalid user role from API Gateway', {
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

    console.log('FINANCE SERVICE: User authenticated via API Gateway', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    console.error('FINANCE SERVICE: Authentication middleware error:', {
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
      console.warn('FINANCE SERVICE: Access denied - insufficient role', {
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
 * Middleware to validate user can access their own financial data or admin can access any
 */
const requireSelfOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const requestedUserId = req.params[userIdParam] || req.body.userId || req.query.userId;
    
    // Admin can access any user's financial data
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // User can only access their own financial data
    if (req.user.id !== requestedUserId) {
      console.warn('FINANCE SERVICE: Unauthorized access attempt to financial data', {
        userId: req.user.id,
        requestedUserId,
        path: req.path,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        message: 'Can only access your own financial data',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
  requireAdmin,
  requireUser,
  requireSelfOrAdmin
}; 