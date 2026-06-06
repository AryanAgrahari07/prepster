const logger = require('../config/logger');

/**
 * Custom application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, appCode = 5000, field = null) {
    super(message);
    this.statusCode = statusCode;
    this.appCode = appCode;
    this.field = field;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static fromAppError(errorDef, field = null) {
    return new AppError(errorDef.message, errorDef.status, errorDef.code, field);
  }
}

/**
 * Global error handler middleware (must be last middleware in Express)
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let appCode = err.appCode || 5000;
  let message = err.message || 'Something went wrong';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    appCode = 4008;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    appCode = 4009;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Value'} already exists`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    appCode = 4001;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    appCode = 4001;
    message = 'Token expired';
  }

  // Log 5xx errors
  if (statusCode >= 500) {
    logger.error({
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: req.user?._id,
    });
  }

  // Mask internal error messages in production
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    message = 'Something went wrong. Please try again.';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: appCode,
      message,
      field: err.field || null,
    },
  });
};

module.exports = { AppError, errorHandler };
