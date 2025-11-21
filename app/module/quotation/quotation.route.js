const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/verifyToken");
const {
  getQuotations,
  getQuotation,
  getQuotationItems,
  postQuotation,
  deleteQuotation,
} = require("./quotation.controller");
const { validateQuotation } = require("./quotation.validator");

router.get("/", verifyToken, getQuotations);
router.get("/items", verifyToken, getQuotationItems);
router.get("/:id", verifyToken, getQuotation);
router.post("/", verifyToken, validateQuotation, postQuotation);
router.delete("/:id", verifyToken, deleteQuotation);

module.exports = router;
