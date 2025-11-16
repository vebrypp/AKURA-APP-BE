const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/verifyToken");
const {
  postQuotation,
  getQuotations,
  deleteQuotation,
} = require("./quotation.controller");
const { validateQuotation } = require("./quotation.validator");

router.get("/", verifyToken, getQuotations);
router.post("/", verifyToken, validateQuotation, postQuotation);
router.delete("/:id", verifyToken, deleteQuotation);

module.exports = router;
