const logger = require('../utils/logger');

const errorMiddleware = (error, req, res, next) => {
  logger.error(`Error: ${error.message}`);
  return res.status(400).json({ message: error.message });
};

module.exports = errorMiddleware;
