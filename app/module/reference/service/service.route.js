const express = require("express");
const route = express.Router();
const verifyToken = require("../../../middleware/verifyToken");
const {
  validateService,
  validateScope,
  validateItem,
} = require("./service.validator");
const {
  getServiceOption,
  getScopes,
  getDescriptions,
  getDescription,
  postService,
  postScope,
  postItem,
  deleteService,
  deleteScope,
  deleteItem,
} = require("./service.controller");

route.get("/description", verifyToken, getDescriptions);
route.get("/description/:id", verifyToken, getDescription);
route.get("/scope", verifyToken, getScopes);
route.get("/option", verifyToken, getServiceOption);
route.post("/", verifyToken, validateService, postService);
route.post("/scope", verifyToken, validateScope, postScope);
route.post("/description/item", validateItem, verifyToken, postItem);
route.delete("/:id", verifyToken, deleteService);
route.delete("/scope/:id", verifyToken, deleteScope);
route.delete("/description/item/:id", verifyToken, deleteItem);

module.exports = route;
