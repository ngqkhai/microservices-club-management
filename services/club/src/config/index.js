const config = {
  eventService: {
    baseURL: process.env.EVENT_SERVICE_URL || 'http://event-service:3003',
    timeout: parseInt(process.env.EVENT_SERVICE_TIMEOUT) || 5000
  },
  authService: {
    baseURL: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    timeout: parseInt(process.env.AUTH_SERVICE_TIMEOUT) || 5000
  }
};

module.exports = config;