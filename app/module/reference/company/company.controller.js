const { validationResult } = require("express-validator");
const prisma = require("../../../config/prismaClient");
const filterHandler = require("../../../utils/filterHandler");
const sortHandler = require("../../../utils/sortHandler");

const getCompanies = async (req, res, next) => {
  const {
    limit = 10,
    page = 1,
    order = "desc",
    sort = "createAt",
    ...filters
  } = req.query;

  try {
    const where = filterHandler(filters);
    const sorter = sortHandler(sort, order);
    console.log(where);

    const currentPage = parseInt(page);
    const take = parseInt(limit);
    const skip = (currentPage - 1) * take;

    const [data, total] = await Promise.all([
      prisma.td_Company.findMany({
        orderBy: sorter,
        skip,
        take,
        where,
      }),

      prisma.td_Company.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: currentPage,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const postCompany = async (req, res, next) => {
  const { company, type, address, staff } = req.body;
  const user = req.user;

  const errorValidation = validationResult(req);

  if (!errorValidation.isEmpty())
    return res
      .status(400)
      .json({ success: false, message: errorValidation.array()[0].msg });

  try {
    const existCompany = await prisma.td_Company.findFirst({
      where: {
        company: company.toUpperCase(),
      },
    });

    if (existCompany)
      return res
        .status(409)
        .json({ success: " false", message: "Company is already exist" });

    const createCompany = await prisma.td_Company.create({
      data: {
        type,
        company: company.toUpperCase(),
        address: address.toUpperCase(),
      },
    });

    if (!createCompany)
      return res.status(409).json({
        success: false,
        message: "Failed to create company reference",
      });

    const createHistoryCompany = await prisma.th_Company.create({
      data: {
        companyId: createCompany.id,
        action: 1,
        name: user?.name,
      },
    });

    if (!createHistoryCompany)
      return res
        .status(409)
        .json({ success: false, message: "Failed to create company history" });

    const createCompanyStaff = async () => {
      let count = 0;

      for (let i = 0; i < staff.length; i++) {
        const { title, name } = staff[i];

        const createStaff = await prisma.td_CompanyStaff.create({
          data: {
            title,
            companyId: createCompany.id,
            name: name.toUpperCase(),
          },
        });

        const createHistoryStaff = await prisma.th_CompanyStaff.create({
          data: {
            companyStaffId: createStaff.id,
            action: 1,
            name: user?.name,
          },
        });

        if (createStaff && createHistoryStaff) count++;
      }

      return count;
    };

    const result = await createCompanyStaff();

    if (result !== staff.length)
      return res
        .status(409)
        .json({ success: false, message: "Failed to create staff" });

    res
      .status(201)
      .json({ success: true, message: "Success create company reference" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
  postCompany,
};
