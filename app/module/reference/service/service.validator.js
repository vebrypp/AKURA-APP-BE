const { body } = require("express-validator");

const validateScopeArray = body("scopeList")
  .isArray({ min: 1 })
  .withMessage("Scope must contain at least one member")
  .bail()
  .custom((scopeArr) => {
    if (!Array.isArray(scopeArr)) {
      throw new Error("Staff must be an array");
    }

    scopeArr.forEach((scopeData) => {
      if (!scopeData.scope || typeof scopeData.scope !== "string") {
        throw new Error(`Scope is invalid. Please check again.`);
      }
    });

    return true;
  });

const validateService = [
  body("service")
    .trim()
    .notEmpty()
    .withMessage("Service cannot be empty")
    .bail(),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .bail(),
  body("size").trim().notEmpty().withMessage("Size cannot be empty").bail(),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity cannot be empty")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Quantity must be number greater than 0")
    .toInt()
    .bail(),
  body("measurementUnit")
    .notEmpty()
    .withMessage("Measurement Unit cannot be empty")
    .bail()
    .isInt()
    .withMessage("Measurement unit is invalid or not supported.")
    .toInt()
    .bail(),
  body("basePrice")
    .notEmpty()
    .withMessage("Base Price cannot be empty")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Base Price must be number greater than 0")
    .toInt()
    .bail(),
  body("specialPrice")
    .notEmpty()
    .withMessage("Special Price cannot be empty")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Special Price must be number greater than 0")
    .toInt()
    .bail(),
];

const validateScope = [
  body("serviceId")
    .trim()
    .notEmpty()
    .withMessage("Service ID cannot be empty")
    .bail(),
  validateScopeArray,
];

module.exports = { validateService, validateScope };
