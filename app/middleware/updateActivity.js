const prisma = require("../config/prismaClient");

const updateActivity = async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (refreshToken) {
    await prisma.td_RefreshToken.updateMany({
      where: { token },
      data: { lastActivity: new Date() },
    });
  }

  next();
};

module.exports = updateActivity;
