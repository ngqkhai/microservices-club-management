import express from 'express';
import bodyParser from 'body-parser';
import { eventRoutes } from './routes/eventRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { connectToDatabase } from './config/database.js';
import { config, logger } from './config/index.js';
import cronJobManager from './utils/cronJobManager.js';
import imageEventConsumer from './services/imageEventConsumer.js';
import userEventConsumer from './services/userEventConsumer.js';

const app = express();
const PORT = config.get('PORT');

logger.info('Starting Event Service...', {
  environment: config.get('NODE_ENV'),
  port: PORT,
  version: config.get('SERVICE_VERSION')
});

// Middleware
app.use(bodyParser.json());

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: config.get('SERVICE_NAME'),
    version: config.get('SERVICE_VERSION'),
    environment: config.get('NODE_ENV'),
    timestamp: new Date().toISOString()
  });
});

// Readiness probe for Kubernetes
app.get('/ready', async (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  res.status(isReady ? 200 : 503).json({ ready: isReady });
});

// Liveness probe for Kubernetes
app.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

// Routes
app.use(eventRoutes);
app.use(adminRoutes);

// Import mongoose for readiness check
import mongoose from 'mongoose';

// Start server
const startServer = async () => {
  try {
    logger.info('Attempting to connect to database...');
    
    // Connect to MongoDB
    const dbConnected = await connectToDatabase();
    
    logger.info('Database connection result', { connected: dbConnected });
    
    if (!dbConnected && !config.isDevelopment()) {
      logger.error('Could not connect to MongoDB. Exiting application.');
      process.exit(1);
    }
    
    // Initialize RabbitMQ consumers (non-blocking - service starts even if RabbitMQ fails)
    const rabbitmqConfig = config.getRabbitMQConfig();
    if (rabbitmqConfig.url) {
      // Image events consumer
      imageEventConsumer.connect()
        .then(() => logger.info('📥 Event service listening for image events'))
        .catch(err => logger.warn('Image event consumer failed to connect', { error: err.message }));
      
      // User events consumer (for user data sync) - start in background
      userEventConsumer.startConsuming()
        .then(() => logger.info('📥 Event service listening for user events'))
        .catch(err => logger.warn('User event consumer failed to connect', { error: err.message }));
    }
    
    app.listen(PORT, () => {
      logger.info(`🚀 Event service started successfully`, {
        port: PORT,
        environment: config.get('NODE_ENV'),
        version: config.get('SERVICE_VERSION')
      });
      
      if (!dbConnected) {
        logger.warn('Running with limited functionality due to database connection issues');
      } else if (config.get('ENABLE_CRON_JOBS')) {
        // Start cron jobs only if database is connected
        logger.info('Starting cron jobs...');
        cronJobManager.startJobs();
      }
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  cronJobManager.stopJobs();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  cronJobManager.stopJobs();
  process.exit(0);
});

startServer();
