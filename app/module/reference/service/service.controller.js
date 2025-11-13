const prisma = require("../../../config/prismaClient");
const filterHandler = require("../../../utils/filterHandler");
const sortHandler = require("../../../utils/sortHandler");

const include = { scope: true };

const getServices = async (req, res, next) => {
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
      prisma.td_Service.findMany({
        include,
        orderBy: sorter,
        skip,
        take,
        where,
      }),

      prisma.td_Service.count({ where }),
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

module.exports = { getServices };
