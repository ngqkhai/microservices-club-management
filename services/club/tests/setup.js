const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Create a MongoDB Memory Server instance
let mongoServer;

// Setup database before tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  console.log('Connected to the in-memory database');
});

// Clear database collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close the database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
  
  console.log('Disconnected from the in-memory database');
});

// Mock environment variables
process.env.NODE_ENV = 'test';
