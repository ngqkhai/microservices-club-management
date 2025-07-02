const jwt = require('jsonwebtoken');
const axios = require('axios');
const logger = require('../utils/logger');

let authServicePublicKey = null;

// Function to get public key from auth service
async function getAuthServicePublicKey() {
  if (authServicePublicKey) {
    return authServicePublicKey;
  }

  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
    const response = await axios.get(`${authServiceUrl}/api/auth/public-key`);
    authServicePublicKey = response.data.publicKey;
    logger.info('Successfully retrieved public key from auth service');
    return authServicePublicKey;
  } catch (error) {
    logger.error('Failed to retrieve public key from auth service:', error.message);
    throw new Error('Unable to verify JWT: Auth service unavailable');
  }
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Không có token xác thực' });
    }

    // Get public key from auth service
    const publicKey = await getAuthServicePublicKey();

    // Verify JWT using the auth service's public key
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'auth-service',
      audience: 'club-management-system'
    });

    req.user = { 
      id: decoded.id, 
      email: decoded.email, 
      role: decoded.role 
    };
    
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    
    if (error.message.includes('Auth service unavailable')) {
      return res.status(503).json({ message: 'Service temporarily unavailable' });
    }
    
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;
