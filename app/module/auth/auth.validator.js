const { body } = require("express-validator");
const handleValidation = require("../../middleware/handleValidation");

const validateRegister = [
  body("name").notEmpty().withMessage("name is empty"),
  body("username").notEmpty().withMessage("username is empty"),
  body("password").notEmpty().withMessage("password is empty"),
  body("company").notEmpty().withMessage("company is empty"),
  body("address").notEmpty().withMessage("company address is empty"),
  body("email").notEmpty().isEmail().withMessage("check your email"),
  body("phone")
    .notEmpty()
    .isMobilePhone()
    .isLength({ max: 12, min: 10 })
    .withMessage("check your phone"),

  handleValidation,
];

module.exports = validateRegister;
