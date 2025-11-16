const express = require("express");
const route = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const { validateService, validateScope } = require("./service.validator");
const {
  getServices,
  getService,
  getScopes,
  postService,
  postScope,
  deleteService,
  deleteScope,
} = require("./service.controller");

route.get("/", verifyToken, getServices);
route.get("/scope", verifyToken, getScopes);
route.get("/:id", verifyToken, getService);
route.post("/", verifyToken, validateService, postService);
route.post("/scope", verifyToken, validateScope, postScope);
route.delete("/:id", verifyToken, deleteService);
route.delete("/scope/:id", verifyToken, deleteScope);

module.exports = route;
