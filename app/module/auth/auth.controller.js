const bcrypt = require("bcrypt");
const prisma = require("../../config/prismaClient");
const cookieOptions = require("../../utils/cookieOptions");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");

const saltRounds = 12;

const updateToken = async (token) => {
  await prisma.td_RefreshToken.update({
    where: { token },
    data: { revoked: true },
  });
};

const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(409).json({ message: "Username/Password empty" });

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

    const checkPassword = bcrypt.compareSync(password, user?.password);

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

const refresh = async (req, res) => {
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

    const now = Date.now();
    const lastActivity = dbToken.lastActivity.getTime();

    const idle =
      now - lastActivity > Number(process.env.INACTIVITY_LIMIT) * 60 * 1000;

    if (!dbToken || dbToken.revoked) {
      res.clearCookie("refreshToken", { ...cookieOptions });

      return res.status(403).json({ message: "Invalid token." });
    }

    if (new Date(dbToken.expiresAt) < new Date()) {
      res.clearCookie("refreshToken", { ...cookieOptions });

      updateToken(token);

      return res
        .status(403)
        .json({ message: "Token expired. Please login again" });
    }

    if (idle) {
      res.clearCookie("refreshToken", { ...cookieOptions });

      updateToken(token);

      return res
        .status(403)
        .json({ message: "Session expired. Please login again" });
    }

    updateToken();

    const newAccess = createAccessToken({ id: payload.id });
    const newRefresh = createRefreshToken({ id: payload.id });

    await prisma.td_RefreshToken.create({
      data: {
        token: newRefresh,
        userId: payload.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(),
      },
    });

    res.cookie("refreshToken", newRefresh, {
      ...cookieOptions,
      maxAge: Number(process.env.REFRESH_TOKEN_AGE) * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken: newAccess });
  } catch (error) {
    console.log(error);
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
