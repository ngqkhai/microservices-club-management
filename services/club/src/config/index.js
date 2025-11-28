require('dotenv').config();
const Joi = require('joi');

/**
 * Centralized Configuration Management for Club Service
 * Validates all environment variables and provides type-safe access
 */
class ConfigManager {
  constructor() {
    this.config = null;
    this.loadAndValidateConfig();
  }

  /**
   * Configuration schema with validation rules
   */
  getConfigSchema() {
    return Joi.object({
      // Environment
      NODE_ENV: Joi.string()
        .valid('development', 'test', 'production')
        .default('development'),

      // Server Configuration
      PORT: Joi.number()
        .port()
        .default(3002),

      SERVICE_NAME: Joi.string()
        .default('club-service'),

      SERVICE_VERSION: Joi.string()
        .default('1.0.0'),

      // MongoDB Configuration
      MONGODB_URI: Joi.string()
        .required()
        .messages({
          'any.required': 'MongoDB URI (MONGODB_URI) is required'
        }),

      // RabbitMQ Configuration
      RABBITMQ_URL: Joi.string()
        .uri({ scheme: ['amqp', 'amqps'] })
        .default('amqp://localhost:5672'),

      RABBITMQ_EXCHANGE: Joi.string()
        .default('club_events'),

      RABBITMQ_QUEUE: Joi.string()
        .default('club_events'),

      // Service URLs
      AUTH_SERVICE_URL: Joi.string()
        .uri()
        .default('http://auth-service:3001'),

      AUTH_SERVICE_TIMEOUT: Joi.number()
        .integer()
        .default(5000),

      EVENT_SERVICE_URL: Joi.string()
        .uri()
        .default('http://event-service:3003'),

      EVENT_SERVICE_TIMEOUT: Joi.number()
        .integer()
        .default(5000),

      // Security
      API_GATEWAY_SECRET: Joi.string()
        .min(16)
        .required()
        .messages({
          'any.required': 'API Gateway Secret (API_GATEWAY_SECRET) is required',
          'string.min': 'API Gateway Secret must be at least 16 characters'
        }),

      // Logging Configuration
      LOG_LEVEL: Joi.string()
        .valid('error', 'warn', 'info', 'debug', 'verbose')
        .default('info'),

      // CORS Configuration
      CORS_ORIGIN: Joi.alternatives()
        .try(
          Joi.string().valid('*'),
          Joi.string().uri(),
          Joi.array().items(Joi.string().uri())
        )
        .default('*'),

      // Health Check Configuration
      HEALTH_CHECK_TIMEOUT_MS: Joi.number()
        .integer()
        .default(5000),

      // Feature Flags
      ENABLE_REQUEST_LOGGING: Joi.boolean()
        .default(true)
    }).unknown(true); // Allow unknown for flexibility
  }

  /**
   * Load and validate configuration from environment variables
   */
  loadAndValidateConfig() {
    const schema = this.getConfigSchema();

    // Extract environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
      SERVICE_NAME: process.env.SERVICE_NAME,
      SERVICE_VERSION: process.env.SERVICE_VERSION,

      // MongoDB
      MONGODB_URI: process.env.MONGODB_URI,

      // RabbitMQ
      RABBITMQ_URL: process.env.RABBITMQ_URL,
      RABBITMQ_EXCHANGE: process.env.RABBITMQ_EXCHANGE,
      RABBITMQ_QUEUE: process.env.RABBITMQ_QUEUE,

      // Service URLs
      AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL,
      AUTH_SERVICE_TIMEOUT: process.env.AUTH_SERVICE_TIMEOUT ? parseInt(process.env.AUTH_SERVICE_TIMEOUT, 10) : undefined,
      EVENT_SERVICE_URL: process.env.EVENT_SERVICE_URL,
      EVENT_SERVICE_TIMEOUT: process.env.EVENT_SERVICE_TIMEOUT ? parseInt(process.env.EVENT_SERVICE_TIMEOUT, 10) : undefined,

      // Security
      API_GATEWAY_SECRET: process.env.API_GATEWAY_SECRET,

      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL,

      // CORS
      CORS_ORIGIN: process.env.CORS_ORIGIN ?
        (process.env.CORS_ORIGIN.includes(',') ?
          process.env.CORS_ORIGIN.split(',').map(url => url.trim()) :
          process.env.CORS_ORIGIN) :
        undefined,

      // Health Check
      HEALTH_CHECK_TIMEOUT_MS: process.env.HEALTH_CHECK_TIMEOUT_MS ? parseInt(process.env.HEALTH_CHECK_TIMEOUT_MS, 10) : undefined,

      // Features
      ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING !== 'false'
    };

    // Validate configuration
    const { error, value } = schema.validate(envVars, {
      abortEarly: false,
      stripUnknown: false
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => `  - ${detail.path.join('.')}: ${detail.message}`)
        .join('\n');

      console.error('❌ Configuration validation failed:');
      console.error(errorMessage);
      console.error('\n📋 Please check your .env file or environment variables.');
      process.exit(1);
    }

    this.config = value;

    // Log configuration summary (without sensitive data)
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Club Service configuration loaded:', JSON.stringify({
        environment: this.config.NODE_ENV,
        port: this.config.PORT,
        serviceName: this.config.SERVICE_NAME,
        mongodb: this.config.MONGODB_URI ? '***configured***' : 'not set',
        rabbitmq: this.config.RABBITMQ_URL ? '***configured***' : 'not set',
        logLevel: this.config.LOG_LEVEL
      }, null, 2));
    }
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Get specific configuration value
   */
  get(key) {
    return this.config[key];
  }

  /**
   * Check if running in development mode
   */
  isDevelopment() {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Check if running in test mode
   */
  isTest() {
    return this.config.NODE_ENV === 'test';
  }

  /**
   * Check if running in production mode
   */
  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Get MongoDB configuration
   */
  getMongoDBConfig() {
    return {
      uri: this.config.MONGODB_URI,
      options: {
        maxPoolSize: this.isProduction() ? 20 : 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      }
    };
  }

  /**
   * Get RabbitMQ configuration
   */
  getRabbitMQConfig() {
    return {
      url: this.config.RABBITMQ_URL,
      exchange: this.config.RABBITMQ_EXCHANGE,
      queue: this.config.RABBITMQ_QUEUE
    };
  }

  /**
   * Get service URLs configuration
   */
  getServicesConfig() {
    return {
      authService: {
        baseURL: this.config.AUTH_SERVICE_URL,
        timeout: this.config.AUTH_SERVICE_TIMEOUT
      },
      eventService: {
        baseURL: this.config.EVENT_SERVICE_URL,
        timeout: this.config.EVENT_SERVICE_TIMEOUT
      }
    };
  }

  /**
   * Get security configuration
   */
  getSecurityConfig() {
    return {
      apiGatewaySecret: this.config.API_GATEWAY_SECRET
    };
  }
}

// Export singleton instance
module.exports = new ConfigManager();
