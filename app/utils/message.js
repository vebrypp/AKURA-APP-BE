const notFoundMessage = "Error 404. Not Found.";
const createMessage = (title) => `${title} created successfully.`;
const deleteMessage = (title) => `${title} has been successfully deleted.`;
const existMessage = (title) => `${title} already exists. Please Check Again.`;

module.exports = {
  notFoundMessage,
  createMessage,
  deleteMessage,
  existMessage,
};
