const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'healthy',
      service: 'user-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'connected',
        type: 'postgresql'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'user-service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        status: 'disconnected',
        type: 'postgresql'
      }
    });
  }
});

// Liveness probe
router.get('/liveness', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe
router.get('/readiness', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 