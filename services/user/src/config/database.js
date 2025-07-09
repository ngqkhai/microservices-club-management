const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration for Sequelize CLI
const dbConfig = {
  development: {
    url: process.env.POSTGRES_URI || 'postgresql://postgres:password@localhost:5432/club_management_user',
    dialect: 'postgres',
    logging: console.log
  },
  test: {
    url: process.env.POSTGRES_URI_TEST || 'postgresql://postgres:password@localhost:5432/club_management_user_test',
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.POSTGRES_URI,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Create Sequelize instance for application use
const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  logging: config.logging,
  dialectOptions: config.dialectOptions || {}
});

// Export configuration for Sequelize CLI
module.exports = dbConfig;

// Export Sequelize instance for application
module.exports.sequelize = sequelize;
