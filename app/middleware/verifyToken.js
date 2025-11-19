const jwt = require("jsonwebtoken");
const prisma = require("../config/prismaClient");

const verifyToken = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "No token provided" });

  const token = auth.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await prisma.td_User.findUnique({ where: { id: payload.id } });

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;

    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await prisma.td_RefreshToken.updateMany({
        where: { token: refreshToken },
        data: { lastActivity: new Date() },
      });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
        code: "ACCESS_TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      message: "Invalid access token",
      code: "ACCESS_TOKEN_INVALID",
    });
  }
};

module.exports = verifyToken;
