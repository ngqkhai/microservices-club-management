// Jest setup file for auth-service

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_ALGORITHM = 'RS256';
process.env.BCRYPT_ROUNDS = '4'; // Lower for faster tests
process.env.API_GATEWAY_SECRET = 'test-api-gateway-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-32-chars-min';

// Silence console during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 500));
});
