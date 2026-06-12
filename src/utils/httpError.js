class AppError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.expose = options.expose ?? statusCode < 500;
    this.details = options.details;
  }
}

function createError(statusCode, message, options) {
  return new AppError(statusCode, message, options);
}

module.exports = {
  AppError,
  createError,
};
