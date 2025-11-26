import mongoose from 'mongoose';
import config from './configManager.js';
import logger from './logger.js';

export const connectToDatabase = async () => {
  try {
    const mongoConfig = config.getMongoDBConfig();
    const MONGODB_URI = mongoConfig.uri;
    
    await mongoose.connect(MONGODB_URI, {
      ...mongoConfig.options,
      bufferCommands: false
    });
    
    // Mask password in log
    const maskedUri = MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    logger.info('Connected to MongoDB - Event Service Database', { database: maskedUri });
    
    return true;
  } catch (error) {
    logger.error('MongoDB connection error', { error: error.message });
    
    if (config.isDevelopment()) {
      logger.warn('Running in development mode without database connection');
      return false;
    }
    
    return false;
  }
};

export const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB', { error: error.message });
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.debug('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.debug('Mongoose disconnected');
});
