const { body } = require("express-validator");
const handleValidation = require("../../middleware/handleValidation");

const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 character long"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username cannot be empty")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 character long"),
  body("password").trim().notEmpty().withMessage("password cannot be empty"),

  handleValidation,
];

module.exports = validateRegister;
