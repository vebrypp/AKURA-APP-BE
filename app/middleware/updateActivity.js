const prisma = require("../config/prismaClient");

const updateActivity = async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      await prisma.td_RefreshToken.updateMany({
        where: { token },
        data: { lastActivity: new Date() },
      });
    } catch {
      throw new Error("Failed to update activity");
    }
  }

  next();
};

module.exports = updateActivity;
