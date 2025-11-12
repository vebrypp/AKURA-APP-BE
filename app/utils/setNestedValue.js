const setNestedValue = (obj, path, value) => {
  const keys = path.split(".");
  let current = obj;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      if (!current[key]) current[key] = {};
      current = current[key];
    }
  });
};

module.exports = setNestedValue;
