require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Import middleware
const { securityHeaders, corsOptions, sanitizeRequest, requestLogger } = require('./middlewares/security');
const { globalErrorHandler, notFoundHandler, timeoutHandler } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');

// Import config
const logger = require('./config/logger');
const { testConnection } = require('./models');

class Application {
  constructor() {
    this.app = express();
    this.setupSwagger();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupSwagger() {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Authentication Service API',
          version: '1.0.0',
          description: 'Microservice for authentication and user management',
          contact: {
            name: 'API Support',
            email: 'support@clubmanagement.com'
          }
        },
        servers: [
          {
            url: process.env.BASE_URL || 'http://localhost:3001',
            description: 'Development server'
          }
        ],
        components: {
          securitySchemes: {
            BearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            },
            GatewayHeaders: {
              type: 'apiKey',
              in: 'header',
              name: 'x-gateway-secret'
            }
          }
        },
        security: [
          {
            GatewayHeaders: []
          }
        ]
      },
      apis: ['./src/routes/*.js'] // Path to the API files
    };

    this.swaggerSpec = swaggerJsdoc(swaggerOptions);
  }

  setupMiddleware() {
    // Trust proxy if behind reverse proxy
    if (process.env.TRUST_PROXY === 'true') {
      this.app.set('trust proxy', 1);
    }

    // Request timeout
    this.app.use(timeoutHandler(30000)); // 30 seconds

    // Security headers
    this.app.use(securityHeaders);

    // CORS
    this.app.use(cors(corsOptions));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parsing
    this.app.use(cookieParser());

    // Request sanitization
    this.app.use(sanitizeRequest);

    // Request logging
    this.app.use(requestLogger);

    // Rate limiting
    this.app.use(generalLimiter);

    // Swagger documentation
    this.app.use('/api/auth/docs', swaggerUi.serve, swaggerUi.setup(this.swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Auth Service API Documentation'
    }));

    // Swagger JSON
    this.app.get('/api/auth/docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(this.swaggerSpec);
    });
  }

  setupRoutes() {
    // Health check route (no authentication required)
    this.app.get('/', (req, res) => {
      res.json({
        service: 'auth-service',
        version: process.env.SERVICE_VERSION || '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        documentation: '/api/auth/docs'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);

    // 404 handler for undefined routes
    this.app.use(notFoundHandler);
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use(globalErrorHandler);
  }

  async initialize() {
    try {
      // Test database connection
      const dbConnected = await testConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }

      // Initialize RabbitMQ connection (optional - service can run without it)
      try {
        const rabbitmqConfig = require('./config/rabbitmq');
        await rabbitmqConfig.connect();
        logger.info('RabbitMQ connected successfully');
      } catch (error) {
        logger.warn('RabbitMQ connection failed, continuing without event publishing:', error.message);
      }

      logger.info('Application initialized successfully', {
        environment: process.env.NODE_ENV,
        version: process.env.SERVICE_VERSION || '1.0.0'
      });

      return true;
    } catch (error) {
      logger.error('Application initialization failed:', error);
      throw error;
    }
  }

  getApp() {
    return this.app;
  }

  async gracefulShutdown() {
    logger.info('Starting graceful shutdown...');

    try {
      // Close database connections
      const { sequelize } = require('./models');
      await sequelize.close();
      logger.info('Database connections closed');

      // Close RabbitMQ connection
      try {
        const rabbitmqConfig = require('./config/rabbitmq');
        await rabbitmqConfig.close();
        logger.info('RabbitMQ connection closed');
      } catch (error) {
        logger.warn('Error closing RabbitMQ connection:', error.message);
      }

      logger.info('Graceful shutdown completed');
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      throw error;
    }
  }
}

module.exports = Application; 