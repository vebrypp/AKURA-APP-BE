const prisma = require("../config/prismaClient");
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    const token = req?.cookies?.Authorization;

    if (!token)
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized! Please login first" });

    const decoded = jwt.verify(token, process.env.APP_KEY);

    const user = await prisma.td_User.findFirst({
      where: {
        id: decoded.id,
      },
    });

    const { password, ...safeUser } = user;

    req.user = safeUser;
  } catch (error) {
    next(error);
  }

  next();
};

module.exports = verifyToken;
