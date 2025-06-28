// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const clubRoutes = require('./routes/clubRoutes');
const { connectToDatabase } = require('./config/database');
const { extractUserFromHeaders } = require('./middlewares/authMiddleware');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Extract user information from headers
app.use(extractUserFromHeaders);

// Routes
app.use('/api', clubRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'club-service' });
});

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