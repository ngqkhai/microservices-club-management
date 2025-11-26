// Load configuration first (handles dotenv internally)
const config = require('./config');
const logger = require('./config/logger');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const clubRoutes = require('./routes/clubRoutes');
const { connectToDatabase } = require('./config/database');
const imageEventConsumer = require('./services/imageEventConsumer');
const userEventConsumer = require('./services/userEventConsumer');

// Initialize Express app
const app = express();
const PORT = config.get('PORT');

// Middleware
app.use(bodyParser.json());

// Configure CORS using config
const corsOrigin = config.get('CORS_ORIGIN');
app.use(cors({
  origin: Array.isArray(corsOrigin) ? corsOrigin : [corsOrigin, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With', 'X-API-Gateway-Secret']
}));

// Health check endpoint (BEFORE auth middleware to allow Docker health checks)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: config.get('SERVICE_NAME'),
    version: config.get('SERVICE_VERSION'),
    environment: config.get('NODE_ENV')
  });
});

// Readiness probe for Kubernetes
app.get('/ready', async (req, res) => {
  // Check if database is connected
  const mongoose = require('mongoose');
  const isReady = mongoose.connection.readyState === 1;
  res.status(isReady ? 200 : 503).json({ ready: isReady });
});

// Liveness probe for Kubernetes
app.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

// Routes (middleware is now applied per route)
app.use('/api', clubRoutes);

// Error handling middleware
const { errorHandler } = require('./middlewares/errorMiddleware');
app.use(errorHandler);

// Start the server
const start = async () => {
  try {
    // Connect to database
    const dbConnected = await connectToDatabase();
    
    if (!dbConnected && !config.isDevelopment()) {
      logger.error('Could not connect to MongoDB. Exiting application.');
      process.exit(1);
    }
    
    // Initialize RabbitMQ consumers
    const rabbitmqConfig = config.getRabbitMQConfig();
    if (rabbitmqConfig.url) {
      try {
        // Image events consumer
        await imageEventConsumer.connect();
        logger.info('📥 Club service listening for image events');
        
        // User events consumer (for user data sync)
        // Don't await - let it connect in background to avoid blocking startup
        userEventConsumer.startConsuming().catch(err => {
          logger.warn('UserEventConsumer initial connection failed, will retry', { error: err.message });
        });
        logger.info('📥 Club service user event consumer initialized');
      } catch (error) {
        logger.warn('Could not connect to RabbitMQ consumers', { error: error.message });
      }
    }
    
    app.listen(PORT, () => {
      logger.info(`🚀 Club service started successfully`, {
        port: PORT,
        environment: config.get('NODE_ENV'),
        version: config.get('SERVICE_VERSION')
      });
      
      if (!dbConnected) {
        logger.warn('Running with limited functionality due to database connection issues');
      }
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

start();
