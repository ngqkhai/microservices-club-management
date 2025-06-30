const Application = require('./app');
const logger = require('./config/logger');
const { setupGlobalErrorHandlers } = require('./middlewares/errorHandler');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  try {
    // Create application instance
    const application = new Application();
    const app = application.getApp();

    // Initialize application
    await application.initialize();

    // Start server
    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Auth Service started successfully`, {
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.SERVICE_VERSION || '1.0.0',
        pid: process.pid,
        documentation: `http://${HOST}:${PORT}/api/auth/docs`
      });
    });

    // Setup graceful shutdown handlers
    setupGlobalErrorHandlers(server);

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Stop accepting new connections
        server.close(async (err) => {
          if (err) {
            logger.error('Error closing server:', err);
            process.exit(1);
          }

          try {
            // Perform application cleanup
            await application.gracefulShutdown();
            logger.info('Server shut down gracefully');
            process.exit(0);
          } catch (shutdownError) {
            logger.error('Error during graceful shutdown:', shutdownError);
            process.exit(1);
          }
        });

        // Force close if graceful shutdown takes too long
        setTimeout(() => {
          logger.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000); // 10 seconds timeout

      } catch (error) {
        logger.error('Error during shutdown process:', error);
        process.exit(1);
      }
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
        pid: process.pid
      });
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection:', {
        reason: reason,
        promise: promise,
        pid: process.pid
      });
      process.exit(1);
    });

    return server;

  } catch (error) {
    logger.error('Failed to start server:', {
      error: error.message,
      stack: error.stack,
      pid: process.pid
    });
    process.exit(1);
  }
}

// Start the server
if (require.main === module) {
  startServer().catch((error) => {
    logger.error('Server startup failed:', error);
    process.exit(1);
  });
}

module.exports = startServer; 