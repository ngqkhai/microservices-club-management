const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../..', process.env.LOG_DIR || 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) log += `\n${stack}`;
    if (Object.keys(meta).length > 0) log += `\n${JSON.stringify(meta, null, 2)}`;
    return log;
  })
);

// Create daily rotate file transport for general logs
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'notification-service-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  format: logFormat
});

// Create error file transport
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'notification-service-error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: '30d',
  format: logFormat
});

// Create email operations file transport
const emailFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'notification-service-email-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  format: logFormat
});

// Configure transports based on environment
const transports = [
  fileRotateTransport,
  errorFileTransport,
  emailFileTransport
];

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'debug'
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: { 
    service: 'notification-service',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat
    })
  ]
});

// Custom logging methods for notification service
logger.notification = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'notification' });
};

logger.email = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'email' });
};

logger.queue = (message, meta = {}) => {
  logger.info(message, { ...meta, category: 'queue' });
};

logger.template = (message, meta = {}) => {
  logger.debug(message, { ...meta, category: 'template' });
};

logger.health = (message, meta = {}) => {
  if (process.env.ENABLE_HEALTH_LOGGING !== 'false') {
    logger.info(message, { ...meta, category: 'health' });
  }
};

module.exports = logger; 