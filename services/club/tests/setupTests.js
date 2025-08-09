jest.setTimeout(30000);

process.env.NODE_ENV = 'test';
process.env.API_GATEWAY_SECRET = process.env.API_GATEWAY_SECRET || 'test-secret';
