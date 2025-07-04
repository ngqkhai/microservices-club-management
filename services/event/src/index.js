import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { eventRoutes, rsvpRoutes, joinRoutes } from './routes/eventRoutes.js';
import { connectToDatabase } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use(eventRoutes);
app.use(rsvpRoutes);
app.use(joinRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    service: 'event-service',
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const dbConnected = await connectToDatabase();
    
    if (!dbConnected && process.env.NODE_ENV !== 'development') {
      console.error('Could not connect to MongoDB. Exiting application.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Event service running on http://localhost:${PORT}`);
      if (!dbConnected) {
        console.warn('⚠️ Running with limited functionality due to database connection issues');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();