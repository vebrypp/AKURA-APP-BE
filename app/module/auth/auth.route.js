const express = require("express");
const router = express.Router();
const validateRegister = require("./auth.validator");
const { login, profile, logout, register } = require("./auth.controller");
const verifyToken = require("../../middleware/verifyToken");

router.post("/login", login);
router.get("/profile", verifyToken, profile);
router.post("/logout", logout);
router.post("/register", validateRegister, register);

module.exports = router;
