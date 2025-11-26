const config = require('../config');
const logger = require('../config/logger');

/**
 * Middleware to validate API Gateway secret only (for public routes)
 * This checks that the request comes through the API Gateway but doesn't require JWT headers
 */
const validateApiGatewaySecret = (req, res, next) => {
  // Skip validation for OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  // MANDATORY: Validate API Gateway secret header first
  const gatewaySecret = req.headers['x-api-gateway-secret'];
  const expectedSecret = config.get('API_GATEWAY_SECRET');
  
  if (!gatewaySecret || gatewaySecret !== expectedSecret) {
    logger.warn('Request rejected - Invalid or missing gateway secret', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      hasSecret: !!gatewaySecret
    });
    
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Request must come through API Gateway',
      code: 'INVALID_GATEWAY'
    });
  }

  logger.debug('Gateway validation passed', {
    path: req.path,
    method: req.method
  });

  next();
};

/**
 * Middleware to extract user information from request headers
 * Headers are set by API Gateway after JWT verification
 * REQUIRES trusted internal header validation first
 */
const validateApiGatewayHeaders = (req, res, next) => {
  const requiredHeaders = ['x-user-id', 'x-user-role'];
  
  // DEBUG: Log all headers for debugging Kong JWT claims injection
  logger.debug('Incoming headers from Kong (Protected Route)', {
    path: req.path,
    method: req.method,
    headers: Object.keys(req.headers)
  });
  
  // Check if request is from API Gateway - MANDATORY for all requests
  const gatewaySecret = req.headers['x-api-gateway-secret'];
  const expectedSecret = config.get('API_GATEWAY_SECRET');
  
  if (!gatewaySecret || gatewaySecret !== expectedSecret) {
    logger.warn('Request rejected: Invalid or missing gateway secret', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      hasSecret: !!gatewaySecret
    });
    
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Request must come through API Gateway',
      code: 'INVALID_GATEWAY'
    });
  }

  logger.debug('Gateway secret validation passed', {
    path: req.path,
    method: req.method
  });

  // Validate required headers for protected endpoints
  const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);
  
  if (missingHeaders.length > 0) {
    logger.warn('Missing required headers', {
      missing: missingHeaders,
      ip: req.ip,
      path: req.path
    });
    
    return res.status(401).json({
      success: false,
      message: 'Missing required authentication headers'
    });
  }

  // Extract and validate user information
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];
  const userFullNameRaw = req.headers['x-user-full-name'];
  
  // Decode base64 encoded full_name (to handle UTF-8 characters like Vietnamese names)
  let userFullName = userFullNameRaw;
  if (userFullNameRaw) {
    try {
      userFullName = Buffer.from(userFullNameRaw, 'base64').toString('utf8');
      logger.debug('Decoded full_name from base64', { original: userFullNameRaw, decoded: userFullName });
    } catch (error) {
      logger.warn('Failed to decode base64 full_name, using original value', { error: error.message });
      userFullName = userFullNameRaw;
    }
  }

  // Validate UUID format for user ID (relaxed regex to support any UUID-like format)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid user ID format'
    });
  }

  // Validate role (case-insensitive)
  const normalizedRole = userRole?.toLowerCase();
  if (!['user', 'admin'].includes(normalizedRole)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid user role'
    });
  }

  // Validate email format if provided
  if (userEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email format'
      });
    }
  }

  // Store user info in request object for easy access (normalize role to lowercase)
  req.user = {
    id: userId,
    role: normalizedRole,
    email: userEmail,
    full_name: userFullName
  };

  // Log successful authentication
  logger.debug('User authenticated via gateway headers', {
    userId,
    userRole,
    path: req.path
  });

  next();
};

/**
 * Middleware to check if user has required roles
 * @param {Array} requiredRoles - Array of roles required to access the endpoint
 */
const requireRoles = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return next();
    }
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    const userRoles = req.user.role || [];
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error: 'INSUFFICIENT_PERMISSIONS',
        required: requiredRoles,
        current: userRoles
      });
    }

    next();
  };
};

/**
 * Middleware to require authentication
 */
const requireAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }
  next();
};

module.exports = {
  validateApiGatewayHeaders,
  requireRoles,
  requireAuth,
  validateApiGatewaySecret
};
