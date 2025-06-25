const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
require('dotenv').config();

const app = express();
app.use(express.json());

sequelize.sync({ alter: true })
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('PostgreSQL connection error:', err));

app.use('/api/users', userRoutes);
app.use(errorMiddleware);

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;