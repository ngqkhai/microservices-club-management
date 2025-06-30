const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
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

// Create daily rotate file transport
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'auth-service-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// Create error file transport
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'auth-service-error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat
});

// Configure transports based on environment
const transports = [
  fileRotateTransport,
  errorFileTransport
];

// Use environment variables directly to avoid circular dependency
const nodeEnv = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug');

if (nodeEnv !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: logLevel || 'debug'
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: logLevel || (nodeEnv === 'production' ? 'info' : 'debug'),
  format: logFormat,
  defaultMeta: { 
    service: 'auth-service',
    environment: nodeEnv || 'development'
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

module.exports = logger; 