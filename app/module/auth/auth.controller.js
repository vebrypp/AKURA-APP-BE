const bcrypt = require("bcrypt");
const prisma = require("../../config/prismaClient");
const cookieOptions = require("../../utils/cookieOptions");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");

const saltRounds = 12;

const revokeToken = async (token) => {
  await prisma.td_RefreshToken.update({
    where: { token },
    data: { revoked: true },
  });
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.td_User.findUnique({
      where: {
        username,
      },
    });

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });

    const checkPassword = bcrypt.compare(password, user.password);

    if (!checkPassword)
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });

    const accessToken = createAccessToken({ id: user.id });
    const refreshToken = createRefreshToken({ id: user.id });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.td_RefreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: Number(process.env.REFRESH_TOKEN_AGE) * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: "Login Success", accessToken });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Token cannot be found." });

    let payload;

    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res
        .status(403)
        .json({ success: false, message: "Invalid Token." });
    }

    const dbToken = await prisma.td_RefreshToken.findUnique({
      where: { token },
    });

    if (!dbToken || dbToken.revoked) {
      res.clearCookie("refreshToken", { ...cookieOptions });

      return res.status(403).json({ message: "Invalid token." });
    }

    if (new Date(dbToken.expiresAt) < new Date()) {
      revokeToken(token);

      res.clearCookie("refreshToken", { ...cookieOptions });

      return res
        .status(403)
        .json({ message: "Token expired. Please login again" });
    }

    const now = Date.now();
    const lastActivity = dbToken.lastActivity.getTime();

    const idle =
      (now - lastActivity) / 1000 / 60 > Number(process.env.INACTIVITY_LIMIT);

    if (idle) {
      revokeToken(token);

      res.clearCookie("refreshToken", { ...cookieOptions });

      return res
        .status(403)
        .json({ message: "Session expired. Please login again" });
    }

    const newAccess = createAccessToken({ id: payload.id });
    const newRefresh = createRefreshToken({ id: payload.id });
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    try {
      await prisma.$transaction([
        prisma.td_RefreshToken.update({
          where: { token },
          data: { revoked: true },
        }),
        prisma.td_RefreshToken.create({
          data: {
            token: newRefresh,
            userId: payload.id,
            expiresAt: newExpiresAt,
            lastActivity: new Date(),
          },
        }),
      ]);
    } catch (error) {
      if (error.code === "P2002") {
        const existingToken = await prisma.td_RefreshToken.findFirst({
          where: { userId: payload.id, revoked: false },
          orderBy: { createAt: "desc" },
        });
        if (existingToken) {
          res.cookie("refreshToken", existingToken.token, {
            ...cookieOptions,
            maxAge: Number(process.env.REFRESH_TOKEN_AGE) * 24 * 60 * 60 * 1000,
          });
          return res.status(200).json({ accessToken: newAccess });
        }
      }
      throw error;
    }

    res.cookie("refreshToken", newRefresh, {
      ...cookieOptions,
      maxAge: Number(process.env.REFRESH_TOKEN_AGE) * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken: newAccess });
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await prisma.td_RefreshToken.updateMany({
        where: { token },
        data: { revoked: true },
      });
    }

    res.clearCookie("refreshToken", { ...cookieOptions });

    res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  const { name, username, password } = req.body;

  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashPassword = bcrypt.hashSync(password, salt);

    const checkUser = await prisma.td_User.findFirst({
      where: {
        OR: [{ name: name.toUpperCase() }, { username }],
      },
    });

    if (checkUser)
      return res
        .status(409)
        .json({ success: false, message: "Name or username already exist" });

    const response = await prisma.td_User.create({
      data: {
        name: name.toUpperCase(),
        username: username,
        password: hashPassword,
      },
    });

    if (!response)
      return res
        .status(409)
        .json({ success: false, message: "Failed to create user" });

    res.status(200).json({ success: true, message: "Register Success" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  profile,
  logout,
  register,
  refresh,
};
