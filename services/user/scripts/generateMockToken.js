const jwt = require('jsonwebtoken');
require('dotenv').config();

const payload = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
};

const token = jwt.sign(payload, process.env.JWT_SECRET);
console.log('Mock JWT:', token);
