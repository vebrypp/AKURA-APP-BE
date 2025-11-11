const { body } = require("express-validator");

const validateCompany = [
  body("type")
    .notEmpty()
    .withMessage("Type cannot be empty")
    .bail()
    .isInt()
    .withMessage("Type must be an integer")
    .bail(),
  body("company")
    .trim()
    .notEmpty()
    .withMessage("Company cannot be empty")
    .bail(),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Company address cannot be empty")
    .bail(),
  body("staff")
    .isArray({ min: 1 })
    .withMessage("Staff must contain at least one member")
    .bail()
    .custom((staffArr) => {
      if (!Array.isArray(staffArr)) {
        throw new Error("Staff must be an array");
      }

      staffArr.forEach((staff) => {
        if (typeof staff.title !== "number" || staff.title < 1) {
          throw new Error(`Staff title must be a valid number`);
        }

        if (
          !staff.name ||
          typeof staff.name !== "string" ||
          staff.name.trim().length < 3
        ) {
          throw new Error(`Staff name must be at least 3 characters long`);
        }
      });

      return true;
    }),
];

module.exports = validateCompany;
