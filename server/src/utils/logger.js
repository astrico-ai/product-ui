const winston = require('winston');

// Define custom log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
};

// Define custom colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Create format for console output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// Create transports array
const transports = [
    // Console transport (always enabled)
    new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),
];

// Only add file transports if not on Vercel (serverless functions can't write to filesystem)
if (process.env.VERCEL !== '1') {
    transports.push(
        // File transport for errors
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        })
    );
}

// Create the logger
const logger = winston.createLogger({
    levels,
    format: winston.format.json(),
    transports,
});

// Create a stream object for Morgan middleware
const stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = {
    logger,
    stream,
    // Helper functions for different log levels
    error: (message, meta = {}) => logger.error(message, meta),
    warn: (message, meta = {}) => logger.warn(message, meta),
    info: (message, meta = {}) => logger.info(message, meta),
    debug: (message, meta = {}) => logger.debug(message, meta),
}; 