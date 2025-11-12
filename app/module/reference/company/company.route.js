const express = require("express");
const router = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const {
  getCompanies,
  getCompany,
  postCompany,
  postStaff,
  getCompanyStaff,
  deleteCompany,
  deleteCompanyStaff,
} = require("./company.controller");
const {
  validateCompany,
  validateCompanyStaff,
} = require("./company.validator");

router.get("/", verifyToken, getCompanies);
router.get("/:id", verifyToken, getCompany);
router.get("/staff/:id", verifyToken, getCompanyStaff);
router.post("/", verifyToken, validateCompany, postCompany);
router.post("/staff", verifyToken, validateCompanyStaff, postStaff);
router.delete("/:id", verifyToken, deleteCompany);
router.delete("/staff/:id", verifyToken, deleteCompanyStaff);

module.exports = router;
