const detectType = require("./detectType");
const setNestedValue = require("./setNestedValue");

const filterHandler = (filters) => {
  const where = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;

      if (detectType(start) === "date" && detectType(end) === "date") {
        const condition = {
          gte: new Date(new Date(start).getTime()),
          lt: new Date(new Date(end).getTime() + 24 * 60 * 60 * 1000),
        };
        setNestedValue(where, key, condition);
        return;
      }
    }

    const type = detectType(value);

    let condition;

    if (type === "date" && !key.includes("size")) {
      condition = {
        equals: new Date(new Date(value).getTime() + 7 * 60 * 60 * 1000),
      };
    } else if (type === "number" && !key.includes("size")) {
      condition = { equals: parseFloat(value) };
    } else {
      condition = { contains: value, mode: "insensitive" };
    }

    setNestedValue(where, key, condition);
  });

  return where;
};

module.exports = filterHandler;
