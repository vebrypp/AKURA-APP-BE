const MESSAGES = {
  INVALID_ID: "Invalid ID. Please check again.",
  NOT_FOUND: "The requested resource was not found.",
  DELETE_DATA_USED: "Delete data Failed. Data has been used.",

  CREATED: (title) => `${title} has been created successfully.`,
  DELETED: (title) => `${title} has been deleted successfully.`,
  EXISTS: (title) => `${title} already exists. Please check again.`,
};

module.exports = MESSAGES;
