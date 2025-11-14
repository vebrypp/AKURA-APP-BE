const express = require("express");
const route = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const { validateService, validateScope } = require("./service.validator");
const {
  getServices,
  getService,
  postService,
  postScope,
} = require("./service.controller");

route.get("/", verifyToken, getServices);
route.get("/:id", verifyToken, getService);
route.post("/", verifyToken, validateService, postService);
route.post("/scope", verifyToken, validateScope, postScope);

module.exports = route;
