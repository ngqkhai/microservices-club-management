// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup test timeout
jest.setTimeout(30000);

// Mock external services
jest.mock('../src/config/rabbitmq', () => ({
  connect: jest.fn().mockResolvedValue(true),
  publishEvent: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
  getStatus: jest.fn().mockReturnValue({ connected: true })
}));

jest.mock('../src/config/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ messageId: 'test-reset-id' }),
  getStatus: jest.fn().mockReturnValue({ configured: true })
}));

// Database setup and teardown
const { sequelize } = require('../src/models');

beforeAll(async () => {
  // Sync database for tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 