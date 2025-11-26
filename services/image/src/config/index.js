require('dotenv').config();
const Joi = require('joi');

/**
 * Centralized Configuration Management for Image Service
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
        .default(3004),
      
      SERVICE_NAME: Joi.string()
        .default('image-service'),
      
      SERVICE_VERSION: Joi.string()
        .default('1.0.0'),

      // Storage Provider Configuration
      STORAGE_PROVIDER: Joi.string()
        .valid('auto', 'cloudinary', 'minio', 's3')
        .default('auto'),

      // Cloudinary Configuration (optional, for production)
      CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
      CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
      CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),

      // MinIO Configuration (for local development)
      MINIO_ENDPOINT: Joi.string().default('minio'),
      MINIO_PORT: Joi.number().port().default(9000),
      MINIO_ACCESS_KEY: Joi.string().default('minioadmin'),
      MINIO_SECRET_KEY: Joi.string().default('minioadmin_local_dev'),
      MINIO_BUCKET_NAME: Joi.string().default('club-management'),
      MINIO_USE_SSL: Joi.boolean().default(false),

      // RabbitMQ Configuration
      RABBITMQ_URL: Joi.string()
        .uri({ scheme: ['amqp', 'amqps'] })
        .default('amqp://localhost:5672'),
      
      RABBITMQ_EXCHANGE: Joi.string()
        .default('club_events'),

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

      // Upload Configuration
      MAX_FILE_SIZE: Joi.number()
        .integer()
        .default(5 * 1024 * 1024), // 5MB

      ALLOWED_FILE_TYPES: Joi.string()
        .default('image/jpeg,image/png,image/gif,image/webp'),

      // CORS Configuration
      CORS_ORIGIN: Joi.alternatives()
        .try(
          Joi.string().valid('*'),
          Joi.string().uri(),
          Joi.array().items(Joi.string().uri())
        )
        .default('*'),

      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: Joi.number()
        .integer()
        .default(900000), // 15 minutes
      
      RATE_LIMIT_MAX_REQUESTS: Joi.number()
        .integer()
        .default(100),

      // Health Check Configuration
      HEALTH_CHECK_TIMEOUT_MS: Joi.number()
        .integer()
        .default(5000),

      // Feature Flags
      ENABLE_REQUEST_LOGGING: Joi.boolean()
        .default(true)
    }).unknown(true);
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
      
      // Storage
      STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
      
      // Cloudinary
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      
      // MinIO
      MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
      MINIO_PORT: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : undefined,
      MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
      MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
      MINIO_BUCKET_NAME: process.env.MINIO_BUCKET_NAME,
      MINIO_USE_SSL: process.env.MINIO_USE_SSL === 'true',
      
      // RabbitMQ
      RABBITMQ_URL: process.env.RABBITMQ_URL,
      RABBITMQ_EXCHANGE: process.env.RABBITMQ_EXCHANGE,
      
      // Security
      API_GATEWAY_SECRET: process.env.API_GATEWAY_SECRET,
      
      // Logging
      LOG_LEVEL: process.env.LOG_LEVEL,
      
      // Upload
      MAX_FILE_SIZE: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE, 10) : undefined,
      ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
      
      // CORS
      CORS_ORIGIN: process.env.CORS_ORIGIN ? 
        (process.env.CORS_ORIGIN.includes(',') ? 
          process.env.CORS_ORIGIN.split(',').map(url => url.trim()) : 
          process.env.CORS_ORIGIN) : 
        undefined,
      
      // Rate Limiting
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : undefined,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : undefined,
      
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
    
    // Determine active storage provider
    this.activeStorageProvider = this._determineStorageProvider();
    
    // Log configuration summary (without sensitive data)
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Image Service configuration loaded:', JSON.stringify({
        environment: this.config.NODE_ENV,
        port: this.config.PORT,
        serviceName: this.config.SERVICE_NAME,
        storageProvider: this.activeStorageProvider,
        rabbitmq: this.config.RABBITMQ_URL ? '***configured***' : 'not set',
        logLevel: this.config.LOG_LEVEL
      }, null, 2));
    }
  }

  /**
   * Determine which storage provider to use
   */
  _determineStorageProvider() {
    const provider = this.config.STORAGE_PROVIDER;
    
    if (provider === 'cloudinary') return 'cloudinary';
    if (provider === 'minio' || provider === 's3') return 'minio';
    
    // Auto-detect based on configured credentials
    if (provider === 'auto') {
      if (this.config.CLOUDINARY_CLOUD_NAME && 
          this.config.CLOUDINARY_API_KEY && 
          this.config.CLOUDINARY_API_SECRET) {
        return 'cloudinary';
      }
      if (this.config.MINIO_ENDPOINT) {
        return 'minio';
      }
    }
    
    return 'minio'; // Default to MinIO for local development
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
   * Check if running in production mode
   */
  isProduction() {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Get storage provider type
   */
  getStorageProvider() {
    return this.activeStorageProvider;
  }

  /**
   * Get Cloudinary configuration
   */
  getCloudinaryConfig() {
    return {
      cloud_name: this.config.CLOUDINARY_CLOUD_NAME,
      api_key: this.config.CLOUDINARY_API_KEY,
      api_secret: this.config.CLOUDINARY_API_SECRET
    };
  }

  /**
   * Get MinIO configuration
   */
  getMinioConfig() {
    return {
      endPoint: this.config.MINIO_ENDPOINT,
      port: this.config.MINIO_PORT,
      useSSL: this.config.MINIO_USE_SSL,
      accessKey: this.config.MINIO_ACCESS_KEY,
      secretKey: this.config.MINIO_SECRET_KEY,
      bucketName: this.config.MINIO_BUCKET_NAME
    };
  }

  /**
   * Get RabbitMQ configuration
   */
  getRabbitMQConfig() {
    return {
      url: this.config.RABBITMQ_URL,
      exchange: this.config.RABBITMQ_EXCHANGE
    };
  }

  /**
   * Get upload configuration
   */
  getUploadConfig() {
    return {
      maxFileSize: this.config.MAX_FILE_SIZE,
      allowedTypes: this.config.ALLOWED_FILE_TYPES.split(',')
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

  /**
   * Get rate limit configuration
   */
  getRateLimitConfig() {
    return {
      windowMs: this.config.RATE_LIMIT_WINDOW_MS,
      max: this.config.RATE_LIMIT_MAX_REQUESTS
    };
  }
}

// Export singleton instance
module.exports = new ConfigManager();

