jest.setTimeout(30000);
process.env.NODE_ENV = 'test';
process.env.API_GATEWAY_SECRET = process.env.API_GATEWAY_SECRET || 'test-secret';
// Minimal DB config for in-memory sqlite (configured in config/index.js for test)
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'a'.repeat(32);
