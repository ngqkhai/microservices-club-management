// Jest setup file for notify-service

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test-password';
process.env.FROM_EMAIL = 'noreply@test.com';

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
