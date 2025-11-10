const bcrypt = require("bcrypt");
const prisma = require("../../config/prismaClient");
const jwt = require("jsonwebtoken");

const saltRounds = 12;
const tokenAge = 1;

const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(409).json({ message: "Username/Password empty" });
  try {
    const checkUser = await prisma.tD_User.findUnique({
      where: {
        username,
      },
    });

    if (!checkUser)
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });

    const checkPassword = bcrypt.compareSync(password, checkUser?.password);

    if (!checkPassword)
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign({ id: checkUser.id }, process.env.APP_KEY, {
      expiresIn: "1h",
    });

    res.cookie("Authorization", `Bearer ${token}`, {
      maxAge: tokenAge * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Login Success" });
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
    res.clearCookie("Authorization");

    res.status(200).json({ success: true, message: "Berhasil Logout" });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  const { name, username, password, company, address, email, phone } = req.body;

  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashPassword = bcrypt.hashSync(password, salt);

    const response = await prisma.tD_User.create({
      data: {
        name,
        username,
        password: hashPassword,
        company,
        companyAddress: address,
        email,
        phone,
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
};
