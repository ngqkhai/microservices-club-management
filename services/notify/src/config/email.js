const logger = require('./logger');

/**
 * Email Configuration for Notification Service
 */
const emailConfig = {
  // Email service provider (gmail, yahoo, outlook, custom)
  service: process.env.EMAIL_SERVICE || 'gmail',
  
  // SMTP Configuration
  smtp: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false, // true for 465, false for other ports
  },
  
  // Authentication
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  
  // Default sender information
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  
  // Template configuration
  templates: {
    dir: process.env.TEMPLATE_DIR || 'templates',
    cacheTTL: parseInt(process.env.TEMPLATE_CACHE_TTL) || 3600000, // 1 hour
  },
  
  // Frontend URLs for email links
  frontend: {
    baseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
    verifyEmailPath: process.env.FRONTEND_VERIFY_EMAIL_PATH || '/verify-email',
    resetPasswordPath: process.env.FRONTEND_RESET_PASSWORD_PATH || '/reset-password',
  },
  
  // Rate limiting
  rateLimit: {
    maxPerMinute: parseInt(process.env.EMAIL_RATE_LIMIT_PER_MINUTE) || 60,
    maxPerHour: parseInt(process.env.EMAIL_RATE_LIMIT_PER_HOUR) || 1000,
  },
  
  // Retry configuration
  retry: {
    maxAttempts: parseInt(process.env.EMAIL_MAX_RETRY_ATTEMPTS) || 3,
    delayMs: parseInt(process.env.EMAIL_RETRY_DELAY_MS) || 1000,
  },
  
  // Development mode configuration
  development: {
    logOnly: process.env.EMAIL_LOG_ONLY === 'true',
    mockSend: process.env.EMAIL_MOCK_SEND === 'true',
  }
};

/**
 * Validate email configuration
 */
function validateEmailConfig() {
  const errors = [];
  
  if (!emailConfig.auth.user) {
    errors.push('EMAIL_USER is required');
  }
  
  if (!emailConfig.auth.pass) {
    errors.push('EMAIL_PASSWORD is required');
  }
  
  if (!emailConfig.from) {
    errors.push('EMAIL_FROM is required');
  }
  
  if (!emailConfig.frontend.baseUrl) {
    errors.push('FRONTEND_BASE_URL is required');
  }
  
  if (errors.length > 0) {
    const isProduction = process.env.NODE_ENV === 'production';
    const message = `Email configuration validation failed: ${errors.join(', ')}`;
    
    if (isProduction) {
      logger.error(message, { errors });
      throw new Error(message);
    } else {
      logger.warn(message + ' - Running in development mode with limited functionality', { errors });
    }
  }
  
  return true;
}

/**
 * Check if email service is properly configured
 */
function isEmailConfigured() {
  try {
    validateEmailConfig();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get email configuration with validation
 */
function getEmailConfig() {
  if (process.env.NODE_ENV !== 'test') {
    validateEmailConfig();
  }
  return emailConfig;
}

module.exports = {
  emailConfig,
  validateEmailConfig,
  isEmailConfigured,
  getEmailConfig
}; 