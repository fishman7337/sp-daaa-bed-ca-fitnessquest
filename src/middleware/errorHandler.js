const { AppError } = require("../utils/httpError");

function notFound(req, res, next) {
  next(new AppError(404, "Route not found"));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const isKnown = error instanceof AppError;
  const statusCode = isKnown ? error.statusCode : 500;
  const message =
    isKnown && error.expose ? error.message : "Internal Server Error";

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message,
    ...(isKnown && error.details ? { details: error.details } : {}),
  });
}

module.exports = {
  errorHandler,
  notFound,
};
