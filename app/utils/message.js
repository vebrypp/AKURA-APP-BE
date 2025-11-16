const MESSAGES = {
  INVALID_ID: "Invalid ID. Please check again.",
  NOT_FOUND: "The requested resource was not found.",

  CREATED: (title) => `${title} has been created successfully.`,
  DELETED: (title) => `${title} has been deleted successfully.`,
  EXISTS: (title) => `${title} already exists. Please check again.`,
};

module.exports = MESSAGES;
