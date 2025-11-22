const express = require("express");
const router = express.Router();
const verifyToken = require("../../middleware/verifyToken");
const {
  getQuotations,
  getQuotation,
  getDescriptions,
  postQuotation,
  postQuotataionItem,
  deleteQuotation,
} = require("./quotation.controller");
const { validateQuotation } = require("./quotation.validator");

router.get("/", verifyToken, getQuotations);
router.get("/descriptions", verifyToken, getDescriptions);
router.get("/:id", verifyToken, getQuotation);
router.post("/", verifyToken, validateQuotation, postQuotation);
router.post("/item", verifyToken, postQuotataionItem);
router.delete("/:id", verifyToken, deleteQuotation);

module.exports = router;
