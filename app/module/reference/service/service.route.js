const express = require("express");
const route = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const { getServices } = require("./service.controller");

route.get("/", verifyToken, getServices);

module.exports = route;
