const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('express-async-errors');
require('dotenv').config();

const logger = require('./config/logger');
const healthRoutes = require('./routes/health');
const { authMiddleware } = require('./middlewares/authMiddleware');

/**
 * Create and configure Express application
 */
function createApp() {
  const app = express();

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // CORS configuration
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];

      // Allow requests with no origin (mobile apps, server-to-server, etc.)
      if (!origin) {return callback(null, true);}

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // Rate limiting (DISABLED)
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    skip: () => true, // Skip all rate limiting (disabled for development)
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url
      });
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
      });
    }
  });

  app.use(limiter);

  // Body parsing middleware
  app.use(express.json({
    limit: '10mb',
    strict: true
  }));
  app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
  }));

  // Request logging middleware
  app.use((req, res, next) => {
    const startTime = Date.now();

    // Log request
    logger.info('Incoming request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: req.get('Content-Length')
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const responseTime = Date.now() - startTime;

      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
        contentLength: res.get('Content-Length')
      });

      originalEnd.call(this, chunk, encoding);
    };

    next();
  });

  // Request sanitization middleware
  app.use((req, res, next) => {
    // Remove potentially dangerous characters from request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    next();
  });

  // Health check routes (no auth required)
  app.use('/health', healthRoutes);

  // API Gateway authentication middleware for all other routes
  app.use('/api', authMiddleware);

  // Root route
  app.get('/', (req, res) => {
    res.json({
      service: 'notification-service',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    logger.warn('Route not found', {
      method: req.method,
      url: req.url,
      ip: req.ip
    });

    res.status(404).json({
      error: 'Route not found',
      message: `The requested endpoint ${req.method} ${req.url} does not exist`,
      timestamp: new Date().toISOString()
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    const errorId = require('uuid').v4();

    logger.error('Unhandled error in request:', err, {
      errorId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(err.status || 500).json({
      error: 'Internal server error',
      message: isDevelopment ? err.message : 'Something went wrong',
      errorId: isDevelopment ? errorId : undefined,
      timestamp: new Date().toISOString(),
      ...(isDevelopment && { stack: err.stack })
    });
  });

  return app;
}

/**
 * Sanitize object to remove potentially dangerous content
 * @param {Object} obj - Object to sanitize
 */
function sanitizeObject(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip dangerous properties
    if (['__proto__', 'constructor', 'prototype'].includes(key)) {
      continue;
    }

    if (typeof value === 'string') {
      // Remove script tags and other potentially dangerous content
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

module.exports = { createApp };