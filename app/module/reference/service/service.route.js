const express = require("express");
const route = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const { validateService } = require("./service.validator");
const {
  getServices,
  getService,
  postService,
} = require("./service.controller");

route.get("/", verifyToken, getServices);
route.get("/:id", verifyToken, getService);
route.post("/", verifyToken, validateService, postService);

module.exports = route;
