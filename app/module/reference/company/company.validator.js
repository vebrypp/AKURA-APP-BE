const { body } = require("express-validator");
const handleValidation = require("../../../middleware/handleValidation");

const validateStaffArray = body("staff")
  .isArray({ min: 1 })
  .withMessage("Staff must contain at least one member")
  .bail()
  .custom((staffArr) => {
    if (!Array.isArray(staffArr)) {
      throw new Error("Staff must be an array");
    }

    staffArr.forEach((staff, index) => {
      const titleNum = Number(staff.title);
      if (Number.isNaN(titleNum) || titleNum < 1) {
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
  });

const validateCompany = [
  body("type")
    .notEmpty()
    .withMessage("Type cannot be empty")
    .bail()
    .isInt()
    .withMessage("Type must be an integer")
    .toInt(),
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
  validateStaffArray,

  handleValidation,
];

const validateCompanyStaff = [
  body("id").notEmpty().withMessage("Company cannot be empty").bail(),
  validateStaffArray,

  handleValidation,
];

module.exports = {
  validateCompany,
  validateCompanyStaff,
};
