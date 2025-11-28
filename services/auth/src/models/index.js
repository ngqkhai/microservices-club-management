const { Sequelize } = require('sequelize');
const config = require('../config/database');
const logger = require('../config/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    logging: dbConfig.logging ? (msg) => logger.debug(msg) : false
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const RefreshToken = require('./RefreshToken')(sequelize, Sequelize.DataTypes);
const PasswordResetToken = require('./PasswordResetToken')(sequelize, Sequelize.DataTypes);

// Define associations
const models = {
  User,
  RefreshToken,
  PasswordResetToken
};

// Setup associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  ...models
};