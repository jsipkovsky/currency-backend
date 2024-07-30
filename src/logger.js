const winston = require('winston');
const ss = require('winston-papertrail');

// Define your Papertrail transport configuration with TLS
const papertrailTransport = new ss.Papertrail({
  host: 'logs3.papertrailapp.com', // Replace with your Papertrail host
  port: 39851,                     // Replace with your Papertrail port
  logFormat: function(level, message) {
    return `${level}: ${message}`; // Format the log message
  },
  // colorize: true,                  // Use colors in the log messages
  inlineMeta: true,                // Include metadata inline
  program: 'my-app',               // Optional: Set a program name
  level: 'debug',                  // Set the default logging level
  sslEnable: true,                 // Enable TLS encryption
  handleExceptions: true           // Handle exceptions
});

// Create the Winston logger instance
const logger = winston.createLogger({
  transports: [papertrailTransport]
});

// Optionally add a console transport for local development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Override console methods to use Winston
console.log = (...args) => logger.info(args.join(' '));
console.error = (...args) => logger.error(args.join(' '));
console.warn = (...args) => logger.warn(args.join(' '));
console.info = (...args) => logger.info(args.join(' '));
console.debug = (...args) => logger.debug(args.join(' '));

module.exports = logger;