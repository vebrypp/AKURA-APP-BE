const { validationResult } = require("express-validator");
const prisma = require("../../../config/prismaClient");
const filterHandler = require("../../../utils/filterHandler");
const sortHandler = require("../../../utils/sortHandler");
const { getCompanyType } = require("./konstanta");
const MSG = require("../../../utils/message");

const includeCompany = {
  staff: true,
};

const includeCompanyStaff = {
  company: true,
};

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

    const currentPage = parseInt(page);
    const take = parseInt(limit);
    const skip = (currentPage - 1) * take;

    const [data, total] = await Promise.all([
      prisma.td_Company.findMany({
        include: includeCompany,
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
    next(error);
  }
};

const getCompany = async (req, res, next) => {
  const { id } = req.params;

  try {
    const company = await prisma.td_Company.findFirst({
      where: {
        id,
      },
      include: includeCompany,
    });

    if (!company)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    const data = {
      id: company.id,
      company: `${getCompanyType(company.type)} ${company.company}`,
      address: company.address,
    };

    return res.status(200).json({ success: true, data });
  } catch (error) {
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
        .json({ success: false, message: MSG.EXISTS("Company") });

    const names = staff.map((s) => s.name.toUpperCase());

    const hasDuplicate = names.some((name, idx) => names.indexOf(name) !== idx);

    if (hasDuplicate) {
      return res.status(400).json({
        success: false,
        message: "Duplicate staff names are not allowed.",
      });
    }

    await prisma.$transaction(async (tx) => {
      const newCompany = await tx.td_Company.create({
        data: {
          type,
          company: company.toUpperCase(),
          address: address.toUpperCase(),
        },
      });

      await tx.th_Company.create({
        data: {
          companyId: newCompany.id,
          action: 1,
          name: user?.name,
        },
      });

      const createdStaffs = await Promise.all(
        staff.map(async ({ title, name }) => {
          const newStaff = await tx.td_CompanyStaff.create({
            data: {
              title,
              name: name.toUpperCase(),
              companyId: newCompany.id,
            },
          });

          await tx.th_CompanyStaff.create({
            data: {
              companyStaffId: newStaff.id,
              action: 1,
              name: user?.name || "SYSTEM",
            },
          });

          return newStaff;
        })
      );

      return { newCompany, createdStaffs };
    });

    res.status(201).json({ success: true, message: MSG.CREATED("Company") });
  } catch (error) {
    next(error);
  }
};

const postStaff = async (req, res, next) => {
  const { id, staff } = req.body;
  const user = req.user;
  const errorValidation = validationResult(req);

  if (!errorValidation.isEmpty())
    return res
      .status(400)
      .json({ success: false, message: errorValidation.array()[0].msg });

  try {
    const company = await prisma.td_Company.findFirst({
      where: {
        id,
      },
    });

    if (!company)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    const names = staff.map((s) => s.name.toUpperCase());

    const hasDuplicate = names.some((name, idx) => names.indexOf(name) !== idx);

    if (hasDuplicate) {
      return res.status(400).json({
        success: false,
        message: "Duplicate staff names are not allowed.",
      });
    }

    const existingStaff = await prisma.td_CompanyStaff.findMany({
      where: {
        companyId: company.id,
        name: { in: names },
      },
    });

    if (existingStaff.length > 0) {
      return res.status(409).json({
        success: false,
        message: MSG.EXISTS("Staff"),
      });
    }

    await prisma.$transaction(async (tx) => {
      const createdStaff = await Promise.all(
        staff.map(async ({ title, name }) => {
          const newStaff = await tx.td_CompanyStaff.create({
            data: {
              companyId: company.id,
              title,
              name: name.toUpperCase(),
            },
          });

          await tx.th_CompanyStaff.create({
            data: {
              companyStaffId: newStaff.id,
              action: 1,
              name: user?.name,
            },
          });

          return newStaff;
        })
      );

      return createdStaff;
    });

    res.status(201).json({ success: true, message: MSG.CREATED("Staff") });
  } catch (error) {
    next(error);
  }
};

const getStaffOption = async (req, res, next) => {
  try {
    const data = await prisma.td_CompanyStaff.findMany({
      include: includeCompanyStaff,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getCompanyStaff = async (req, res, next) => {
  const { id } = req.params;

  try {
    const company = await prisma.td_Company.findFirst({
      where: {
        id,
      },
    });

    if (!company)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    const data = await prisma.td_CompanyStaff.findMany({
      where: {
        companyId: company.id,
      },
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next();
  }
};

const deleteCompany = async (req, res, next) => {
  const { id } = req.params;

  try {
    const company = await prisma.td_Company.findFirst({
      where: {
        id,
      },
      include: includeCompany,
    });

    if (!company)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    const staffIds = company.staff.map((staff) => staff.id);

    await prisma.$transaction(async (tx) => {
      if (staffIds.length > 0) {
        await tx.th_CompanyStaff.deleteMany({
          where: {
            companyStaffId: {
              in: staffIds,
            },
          },
        });

        await tx.td_CompanyStaff.deleteMany({
          where: {
            companyId: company.id,
          },
        });
      }

      await tx.th_Company.deleteMany({
        where: {
          companyId: company.id,
        },
      });

      await tx.td_Company.delete({
        where: {
          id: company.id,
        },
      });
    });

    res.status(200).json({ success: true, message: MSG.DELETED("Company") });
  } catch (error) {
    next(error);
  }
};

const deleteCompanyStaff = async (req, res, next) => {
  const { id } = req.params;

  try {
    const staff = await prisma.td_CompanyStaff.findFirst({
      where: {
        id,
      },
    });

    if (!staff)
      return res
        .status(200)
        .json({ success: false, message: MSG.NOT_FOUND("Staff") });

    await prisma.$transaction([
      prisma.th_CompanyStaff.deleteMany({
        where: {
          companyStaffId: id,
        },
      }),

      prisma.td_CompanyStaff.delete({
        where: {
          id,
        },
      }),
    ]);

    res.status(200).json({ success: true, message: MSG.DELETED("Staff") });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompany,
  getCompanies,
  getCompanyStaff,
  getStaffOption,
  postCompany,
  postStaff,
  deleteCompany,
  deleteCompanyStaff,
};
