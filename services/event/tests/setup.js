// Jest setup file for event-service (ES Modules)

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/event_service_test';

// Global test timeout
// Note: jest.setTimeout not available in ESM, use testTimeout in config

// Clean up after all tests
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
