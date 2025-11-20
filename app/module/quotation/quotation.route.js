const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/verifyToken");
const {
  getQuotations,
  getQuotataion,
  postQuotation,
  deleteQuotation,
} = require("./quotation.controller");
const { validateQuotation } = require("./quotation.validator");

router.get("/", verifyToken, getQuotations);
router.get("/:id", verifyToken, getQuotataion);
router.post("/", verifyToken, validateQuotation, postQuotation);
router.delete("/:id", verifyToken, deleteQuotation);

module.exports = router;
