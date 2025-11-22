const { body } = require("express-validator");
const handleValidation = require("../../middleware/handleValidation");

const validateServiceArray = body("services")
  .isArray({ min: 1 })
  .withMessage("Services must contain at least one service")
  .bail()
  .custom((serviceArr) => {
    if (!Array.isArray(serviceArr)) {
      throw new Error("Services must be an array");
    }

    serviceArr.forEach((serviceData) => {
      if (!serviceData.id || typeof serviceData.id !== "string") {
        throw new Error(`Service is invalid. Please check again.`);
      }
    });

    return true;
  });

const validateQuotation = [
  body("staffId")
    .trim()
    .notEmpty()
    .withMessage("Customer cannot be empty.")
    .bail(),
  body("inquiryMethod")
    .notEmpty()
    .withMessage("cannot be empty.")
    .bail()
    .isInt()
    .withMessage("Invalid Inquiry Method.")
    .bail()
    .toInt(),
  body("inquiryDate")
    .notEmpty()
    .withMessage("Inquiry date cannot be empty ")
    .bail()
    .isDate()
    .withMessage("Invalid inquiry date.")
    .bail()
    .toDate(),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject cannot be empty.")
    .bail(),
  body("termOfPayment")
    .trim()
    .notEmpty()
    .withMessage("Term of payment cannot be empty.")
    .bail(),
  body("validity")
    .trim()
    .notEmpty()
    .withMessage("Validity cannot be empty.")
    .bail(),
  body("tax")
    .notEmpty()
    .withMessage("Tax cannot be empty.")
    .bail()
    .isInt()
    .withMessage("Invalid tax.")
    .bail()
    .toInt(),
  body("supplyAkura")
    .trim()
    .notEmpty()
    .withMessage("Supply akura cannot be empty.")
    .bail(),
  body("supplyCustomer")
    .trim()
    .notEmpty()
    .withMessage("Supply customer cannot be empty.")
    .bail(),
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty.")
    .bail(),
  body("accomplished")
    .trim()
    .notEmpty()
    .withMessage("Accomplished cannot be empty.")
    .bail(),
  body("deliveryReports")
    .trim()
    .notEmpty()
    .withMessage("Delivery reports cannot be empty.")
    .bail(),
  validateServiceArray,

  handleValidation,
];

const validateItem = [
  body("descriptionItemId")
    .trim()
    .notEmpty()
    .withMessage("Description item id cannot be empty.")
    .bail(),
  body("quotationDescriptionId")
    .trim()
    .notEmpty()
    .withMessage("Quotation description cannot be empty.")
    .bail(),
  body("name").trim().notEmpty().withMessage("Name cannot be empty.").bail(),
  body("quantity")
    .trim()
    .notEmpty()
    .withMessage("Quantity item id cannot be empty.")
    .bail()
    .isInt({ min: 0 })
    .withMessage("Invalid quantity type.")
    .bail()
    .toInt(),
  body("discount")
    .optional()
    .trim()
    .isInt({ min: 0 })
    .withMessage("Invalid discount type.")
    .bail()
    .toInt(),

  handleValidation,
];

module.exports = {
  validateQuotation,
  validateItem,
};
