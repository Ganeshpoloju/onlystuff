class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const notFound = (msg = 'Not found') => new AppError(msg, 404);
const forbidden = (msg = 'Forbidden') => new AppError(msg, 403);
const unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401);
const badRequest = (msg) => new AppError(msg, 400);

module.exports = { AppError, notFound, forbidden, unauthorized, badRequest };
