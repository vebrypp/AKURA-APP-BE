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

const getInquiryMethod = (val) => {
  switch (val) {
    case 1:
      return "Email";
    case 2:
      return "WhatsApp";
    case 3:
      return "Verbal";
    case 4:
      return "Job Order Request";

    default:
      return null;
  }
};

module.exports = {
  konstantaAction,
  getMeasurementUnit,
  getInquiryMethod,
};
