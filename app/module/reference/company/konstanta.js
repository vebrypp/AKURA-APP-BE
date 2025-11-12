export const getCompanyType = (konstanta) => {
  switch (konstanta) {
    case 1:
      return "PT. ";
    case 2:
      return "CV. ";
    case 3:
      return "PR. ";

    default:
      return null;
  }
};
