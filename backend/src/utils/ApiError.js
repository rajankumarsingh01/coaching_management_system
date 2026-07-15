class ApiError extends Error {
  constructor(statusCode, message, errors = [], errorCode = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode;   // NEW — optional machine-readable code
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;