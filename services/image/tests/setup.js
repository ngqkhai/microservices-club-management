// Jest setup file for image-service

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.STORAGE_PROVIDER = 'minio';
process.env.MINIO_ENDPOINT = 'localhost';
process.env.MINIO_PORT = '9000';
process.env.MINIO_ACCESS_KEY = 'test-access-key';
process.env.MINIO_SECRET_KEY = 'test-secret-key';
process.env.MINIO_BUCKET = 'test-bucket';
process.env.MAX_FILE_SIZE = '10485760';

// Global test timeout
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
