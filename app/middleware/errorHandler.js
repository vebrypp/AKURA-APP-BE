const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message:
      err?.response?.data?.message ||
      err?.response?.message ||
      err.message ||
      "Internal Server Error",
  });
};

module.exports = errorHandler;
