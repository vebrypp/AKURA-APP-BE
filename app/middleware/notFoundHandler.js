const { notFoundMessage } = require("../utils/message");

const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: notFoundMessage });
};

module.exports = notFoundHandler;
