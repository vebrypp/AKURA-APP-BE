const konstantaAction = {
  create: 1,
  edit: 2,
  delete: 3,
};

const getMeasurementUnit = (val) => {
  switch (val) {
    case 1:
      return "Joint";
    case 2:
      return "EA";
    case 3:
      return "Connection";
    case 4:
      return "Day";

    default:
      return null;
  }
};

module.exports = {
  konstantaAction,
  getMeasurementUnit,
};
