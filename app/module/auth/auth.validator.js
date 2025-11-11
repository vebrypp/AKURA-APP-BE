const { body } = require("express-validator");
const handleValidation = require("../../middleware/handleValidation");

const validateRegister = [
  body("name").notEmpty().withMessage("name is empty"),
  body("username").notEmpty().withMessage("username is empty"),
  body("password").notEmpty().withMessage("password is empty"),

  handleValidation,
];

module.exports = validateRegister;
