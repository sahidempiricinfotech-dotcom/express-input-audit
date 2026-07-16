function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.status || 500).json({ error: error.message || 'internal server error' });
}

module.exports = errorHandler;
