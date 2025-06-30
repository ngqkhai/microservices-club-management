const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');
const { TooManyRequestsError } = require('../utils/errors');

// Rate limiting configuration
const config = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  standardizeHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/auth/health';
  },
  keyGenerator: (req) => {
    // Use user ID if available, otherwise fall back to IP
    return req.user?.id || req.ip;
  },

  handler: (req, res, next) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id,
      endpoint: req.path,
      userAgent: req.get('User-Agent')
    });
    
    const error = new TooManyRequestsError(
      'Too many requests from this IP/user, please try again later'
    );
    next(error);
  }
};

// General rate limiter
const generalLimiter = rateLimit({
  ...config,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  ...config,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true // Don't count successful requests
});

// Very strict rate limiter for password reset
const passwordResetLimiter = rateLimit({
  ...config,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again in an hour',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
  }
});

// Rate limiter for registration
const registrationLimiter = rateLimit({
  ...config,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later',
    code: 'REGISTRATION_RATE_LIMIT_EXCEEDED'
  }
});

// Rate limiter for token refresh
const refreshLimiter = rateLimit({
  ...config,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Allow more frequent token refreshes
  message: {
    success: false,
    message: 'Too many token refresh attempts, please try again later',
    code: 'REFRESH_RATE_LIMIT_EXCEEDED'
  }
});

// Dynamic rate limiter based on user behavior
const createDynamicLimiter = (baseMax = 100, factor = 1) => {
  return rateLimit({
    ...config,
    max: (req) => {
      // Reduce limit for suspicious behavior
      const suspiciousFactors = [
        req.get('User-Agent')?.includes('bot') ? 0.5 : 1,
        req.headers['x-forwarded-for'] ? 0.8 : 1, // Proxy/VPN detection
        req.user?.role === 'ADMIN' ? 2 : 1 // Higher limit for admins
      ];
      
      const adjustedMax = suspiciousFactors.reduce((acc, curr) => acc * curr, baseMax * factor);
      return Math.floor(adjustedMax);
    },
    message: (req) => ({
      success: false,
      message: 'Request limit exceeded based on usage patterns',
      code: 'DYNAMIC_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(config.windowMs / 1000)
    })
  });
};

// Progressive rate limiter that increases restrictions on repeated violations
const createProgressiveLimiter = () => {
  const violations = new Map();
  
  return rateLimit({
    ...config,
    max: (req) => {
      const key = req.ip;
      const userViolations = violations.get(key) || 0;
      
      // Decrease limit based on previous violations
      const baseLimit = 100;
      const penalty = Math.min(userViolations * 10, 80); // Max 80% reduction
      return Math.max(baseLimit - penalty, 10); // Minimum 10 requests
    },
    handler: (req, res, next) => {
      const key = req.ip;
      violations.set(key, (violations.get(key) || 0) + 1);
      
      logger.warn('Progressive rate limit exceeded', {
        ip: req.ip,
        violations: violations.get(key),
        endpoint: req.path,
        userAgent: req.get('User-Agent')
      });
      
      // Clean up old violations periodically
      setTimeout(() => {
        const current = violations.get(key) || 0;
        if (current > 0) {
          violations.set(key, current - 1);
        }
      }, 60 * 60 * 1000); // Reduce violation count after 1 hour
      
      const error = new TooManyRequestsError(
        'Request limit exceeded due to repeated violations'
      );
      next(error);
    }
  });
};

// Whitelist-based rate limiter
const createWhitelistLimiter = (whitelist = []) => {
  return rateLimit({
    ...config,
    skip: (req) => {
      // Skip rate limiting for whitelisted IPs
      return whitelist.includes(req.ip) || req.path === '/api/auth/health';
    }
  });
};

// Rate limiter with custom store (for Redis clustering)
const createClusterLimiter = (store) => {
  return rateLimit({
    ...config,
    store: store,
    max: 100
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  refreshLimiter,
  createDynamicLimiter,
  createProgressiveLimiter,
  createWhitelistLimiter,
  createClusterLimiter
}; 