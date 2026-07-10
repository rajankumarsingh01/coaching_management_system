const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
  }

  logger.error(`${req.method} ${req.originalUrl} - ${message}`);

  res.status(statusCode || 500).json({
    success: false,
    message,
    errors: err.errors || [],
    stack: env.nodeEnv === 'development' ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;