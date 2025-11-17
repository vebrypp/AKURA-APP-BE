const errorHandler = (err, req, res, next) => {
  if (err?.code === "P2024")
    return res
      .status(err.status || 500)
      .json({ success: false, message: "Request timeout." });

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
