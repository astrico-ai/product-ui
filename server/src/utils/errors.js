class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class APIError extends AppError {
    constructor(message, statusCode = 500) {
        super(message, statusCode);
        this.name = 'APIError';
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production mode: don't leak error details
        res.status(err.statusCode).json({
            status: err.status,
            message: err.isOperational ? err.message : 'Something went wrong!'
        });
    }
};

// Async handler wrapper to eliminate try-catch blocks
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    AppError,
    APIError,
    ValidationError,
    errorHandler,
    asyncHandler
}; 