const config = require('./config');
const logger = require('./config/logger');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const imageRoutes = require('./routes/imageRoutes');
const rabbitmqService = require('./config/rabbitmq');
const imageService = require('./services/imageService');

const app = express();
const PORT = config.get('PORT');

// Trust proxy (required for Kong)
app.set('trust proxy', true);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOrigin = config.get('CORS_ORIGIN');
app.use(cors({
  origin: Array.isArray(corsOrigin) ? corsOrigin : [corsOrigin, 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const rateLimitConfig = config.getRateLimitConfig();
const limiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint with storage status
app.get('/health', (req, res) => {
  const storageHealth = imageService.getHealthStatus();

  res.json({
    status: 'OK',
    service: config.get('SERVICE_NAME'),
    version: config.get('SERVICE_VERSION'),
    environment: config.get('NODE_ENV'),
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    storage: storageHealth
  });
});

// Ready check - only return OK if storage is initialized
app.get('/ready', (req, res) => {
  const health = imageService.getHealthStatus();

  if (health.initialized) {
    res.json({ ready: true, provider: health.provider });
  } else {
    res.status(503).json({ ready: false, reason: 'Storage not initialized' });
  }
});

// Live check - simple ping
app.get('/live', (req, res) => {
  res.json({ alive: true });
});

// API routes
app.use('/api/images', imageRoutes);

// Error handling middleware
app.use((error, req, res, _next) => {
  logger.error('Server error', { error: error.message, stack: error.stack });

  if (error.code === 'LIMIT_FILE_SIZE') {
    const uploadConfig = config.getUploadConfig();
    return res.status(400).json({
      error: 'File too large',
      maxSize: `${Math.round(uploadConfig.maxFileSize / 1024 / 1024)}MB`
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: 'Too many files',
      maxFiles: 10
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: config.isDevelopment() ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await rabbitmqService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await rabbitmqService.close();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    logger.info('Image Service Starting...', {
      environment: config.get('NODE_ENV'),
      port: PORT,
      version: config.get('SERVICE_VERSION')
    });

    // Initialize storage provider (Cloudinary or MinIO)
    logger.info('Initializing storage provider...');
    await imageService.initialize();

    // Connect to RabbitMQ
    logger.info('Connecting to RabbitMQ...');
    try {
      await rabbitmqService.connect();
    } catch (mqError) {
      logger.warn('RabbitMQ connection failed (service will work without events)', { error: mqError.message });
    }

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info('🚀 Image Service started successfully', {
        port: PORT,
        environment: config.get('NODE_ENV'),
        version: config.get('SERVICE_VERSION'),
        storage: imageService.getProviderName()
      });

      console.log('');
      console.log('='.repeat(50));
      console.log(`✅ Image Service running on port ${PORT}`);
      console.log('='.repeat(50));
      console.log('');
      console.log('📍 Endpoints:');
      console.log(`   Upload:       POST http://localhost:${PORT}/api/images/upload`);
      console.log(`   Bulk upload:  POST http://localhost:${PORT}/api/images/upload/bulk`);
      console.log(`   Health:       GET  http://localhost:${PORT}/health`);
      console.log(`   Ready:        GET  http://localhost:${PORT}/ready`);
      console.log('');
      console.log(`📦 Storage: ${imageService.getProviderName()}`);
      console.log('');
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
