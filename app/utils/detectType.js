const detectType = (value) => {
  if (!isNaN(value) && value.trim() !== "") return "number";

  const date = new Date(value);
  if (!isNaN(date.getTime())) return "date";

  return "string";
};

module.exports = detectType;
