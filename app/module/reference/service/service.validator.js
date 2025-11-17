const { body } = require("express-validator");

const validateScopeArray = body("scopes")
  .isArray({ min: 1 })
  .withMessage("Scope must contain at least one scope")
  .bail()
  .custom((scopeArr) => {
    // 1. Must be array
    if (!Array.isArray(scopeArr)) {
      throw new Error("Scope must be an array");
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
      throw new Error("Duplicate scope detected. Scopes must be unique.");
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
];

const validateScope = [
  body("descriptionId")
    .trim()
    .notEmpty()
    .withMessage("Description id cannot be empty")
    .bail(),
  validateScopeArray,
];

module.exports = { validateService, validateScope };
