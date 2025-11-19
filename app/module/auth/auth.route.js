const express = require("express");
const router = express.Router();
const validateRegister = require("./auth.validator");
const {
  login,
  profile,
  logout,
  register,
  refresh,
} = require("./auth.controller");
const verifyToken = require("../../middleware/verifyToken");
const updateActivity = require("../../middleware/updateActivity");

router.get("/profile", verifyToken, profile);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", updateActivity, refresh);
router.post("/register", validateRegister, register);

module.exports = router;
