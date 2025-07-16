// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const clubRoutes = require('./routes/clubRoutes');
const { connectToDatabase } = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(bodyParser.json());

// Configure CORS to allow frontend origin
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Accept', 'Authorization', 'Content-Type', 'X-Requested-With', 'X-API-Gateway-Secret']
}));

// Health check endpoint (BEFORE auth middleware to allow Docker health checks)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'club-service' });
});

// Routes (middleware is now applied per route)
app.use('/api', clubRoutes);

// Error handling middleware
const { errorHandler } = require('./middlewares/errorMiddleware');
app.use(errorHandler);

// Start the server
const start = async () => {
  try {
    // Connect to database
    const dbConnected = await connectToDatabase();
    
    if (!dbConnected && process.env.NODE_ENV !== 'development' && process.env.MOCK_DB !== 'true') {
      console.error('Could not connect to MongoDB. Exiting application.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`Club service running on port ${PORT}`);
      if (!dbConnected) {
        console.warn('⚠️ Running with limited functionality due to database connection issues');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();