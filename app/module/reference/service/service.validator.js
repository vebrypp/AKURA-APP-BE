const { body } = require("express-validator");
const findDuplicateItems = require("../../../utils/findDuplicate");
const handleValidation = require("../../../middleware/handleValidation");

const validateScopeArray = body("scopes")
  .isArray({ min: 1 })
  .withMessage("Scope must contain at least one scope.")
  .bail()
  .custom((scopeArr) => {
    // 1. Must be array
    if (!Array.isArray(scopeArr)) {
      throw new Error("Scope must be an array.");
    }

    // 2. Validate each scope item
    scopeArr.forEach((scopeData) => {
      if (!scopeData.scope || typeof scopeData.scope !== "string") {
        throw new Error(`Scope is invalid. Please check again.`);
      }
    });

    // 3. Check duplicates
    const normalized = scopeArr.map((s) => s.scope.toUpperCase().trim());
    const unique = new Set(normalized);

    if (unique.size !== normalized.length) {
      throw new Error("Duplicate scope detected. Scope must be unique.");
    }

    return true;
  });

const validateItemArray = body("items")
  .isArray({ min: 1 })
  .withMessage("Item must contain at least one item")
  .bail()
  .custom((itemArr) => {
    if (!Array.isArray(itemArr)) {
      throw new Error("Item must be an array.");
    }

    itemArr.forEach((item, index) => {
      const { size, quantity, measurementUnit, basePrice, specialPrice } = item;

      // --- Required field check ---
      if (
        size === undefined ||
        quantity === undefined ||
        measurementUnit === undefined ||
        basePrice === undefined ||
        specialPrice === undefined
      ) {
        throw new Error(
          `Item ${index + 1}: Data not complete, please check again.`
        );
      }

      // --- Type check ---
      if (typeof size !== "string") {
        throw new Error(`Invalid Size.`);
      }
      if (typeof quantity !== "number") {
        throw new Error(`Invalid quantity.`);
      }
      if (typeof measurementUnit !== "number") {
        throw new Error(`Invalid Measurement.`);
      }
      if (typeof basePrice !== "number") {
        throw new Error(`Invalid Base price.`);
      }
      if (typeof specialPrice !== "number") {
        throw new Error(`Invalid Special price.`);
      }
    });

    // --- Duplicate check based on SIZE ---
    const unique = findDuplicateItems(itemArr);

    if (unique.length !== 0) {
      throw new Error("Duplicate Item detected. Item size must be unique.");
    }

    return true;
  });

const validateService = [
  body("newService")
    .isBoolean()
    .withMessage("Invalid newService value.")
    .toBoolean()
    .bail(),
  body("serviceId")
    .custom((val, { req }) => {
      if (req.body.newService === false && !val) {
        throw new Error("Service cannot be empty");
      }
      return true;
    })
    .bail()
    .if((value, { req }) => req.body.newService === false)
    .isUUID()
    .withMessage("Invalid service ID"),
  body("service").custom((val, { req }) => {
    if (req.body.newService === true && !val) {
      throw new Error("Service cannot be empty");
    }
    return true;
  }),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .bail(),
  validateScopeArray,

  handleValidation,
];

const validateScope = [
  body("descriptionId")
    .trim()
    .notEmpty()
    .withMessage("Description id cannot be empty")
    .bail(),
  validateScopeArray,

  handleValidation,
];

const validateItem = [
  body("descriptionId")
    .trim()
    .notEmpty()
    .withMessage("Description id cannot be empty")
    .bail(),
  validateItemArray,

  handleValidation,
];

module.exports = { validateService, validateScope, validateItem };
