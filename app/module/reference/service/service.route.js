const express = require("express");
const route = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const { validateService } = require("./service.validator");
const { getServices, postService } = require("./service.controller");

route.get("/", verifyToken, getServices);
route.post("/", verifyToken, validateService, postService);

module.exports = route;
