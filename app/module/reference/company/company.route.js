const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const { getCompanies, postCompany } = require("./company.controller");
const validateCompany = require("./company.validator");

router.get("/", verifyToken, getCompanies);
router.post("/", verifyToken, validateCompany, postCompany);

module.exports = router;
