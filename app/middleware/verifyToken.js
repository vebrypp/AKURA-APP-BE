const prisma = require("../config/prismaClient");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth)
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again.",
    });

  const token = auth.split(" ")[1];

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Session expired. Please login again",
    });

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await prisma.td_User.findUnique({
      where: {
        id: payload.id,
      },
    });

    const { password, createAt, updatedAt, ...safeUser } = user;

    req.user = safeUser;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

module.exports = verifyToken;
