const express = require("express");
const route = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const { validateService, validateScope } = require("./service.validator");
const {
  getServiceOption,
  getScopes,
  getDescriptions,
  getDescription,
  postService,
  postScope,
  deleteService,
  deleteScope,
} = require("./service.controller");

route.get("/description", verifyToken, getDescriptions);
route.get("/description/:id", verifyToken, getDescription);
route.get("/option", verifyToken, getServiceOption);
route.get("/scope", verifyToken, getScopes);
route.post("/", verifyToken, validateService, postService);
route.post("/scope", verifyToken, validateScope, postScope);
route.delete("/:id", verifyToken, deleteService);
route.delete("/scope/:id", verifyToken, deleteScope);

module.exports = route;
