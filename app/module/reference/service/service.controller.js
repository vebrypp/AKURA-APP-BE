const { validationResult } = require("express-validator");
const prisma = require("../../../config/prismaClient");
const filterHandler = require("../../../utils/filterHandler");
const { createMessage, notFoundMessage } = require("../../../utils/message");
const sortHandler = require("../../../utils/sortHandler");
const {
  konstantaAction,
  getMeasurementUnit,
} = require("../../../utils/konstanta");

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
      data: data.map(({ measurementUnit, ...rest }) => ({
        ...rest,
        measurementUnit: getMeasurementUnit(measurementUnit),
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getService = async (req, res, next) => {
  const { id } = req.params;

  try {
    const data = await prisma.td_Service.findFirst({
      where: {
        id,
      },
    });

    if (!data)
      return res.status(404).json({ success: false, message: notFoundMessage });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const postService = async (req, res, next) => {
  const {
    service,
    description,
    size,
    quantity,
    measurementUnit,
    basePrice,
    specialPrice,
  } = req.body;
  const user = req.user;

  const errorValidation = validationResult(req);

  if (!errorValidation.isEmpty())
    return res
      .status(409)
      .json({ success: false, message: errorValidation.array()[0].msg });

  try {
    await prisma.$transaction(async (tx) => {
      const createService = await tx.td_Service.create({
        data: {
          service,
          description,
          size,
          quantity,
          measurementUnit,
          basePrice,
          specialPrice,
        },
      });

      await tx.th_Service.create({
        data: {
          serviceId: createService.id,
          name: user?.name,
          action: konstantaAction.create,
        },
      });
    });
    res.status(201).json({ success: true, message: createMessage("Service") });
  } catch (error) {
    next(error);
  }
};
const postScope = async (req, res, next) => {
  const { serviceId, scope } = req.body;
  const user = req.user;

  try {
    await prisma.$transaction(async (tx) => {
      const newScope = await tx.td_ServiceScope.create({
        data: {
          serviceId,
          scope,
        },
      });

      await tx.th_ServiceScope.create({
        data: {
          serviceScopeId: newScope.id,
          action: konstantaAction.create,
          name: user?.name,
        },
      });
    });
    res.status(201).json({ success: true, message: createMessage("Scope") });
  } catch (error) {
    next(error);
  }
};

module.exports = { getService, getServices, postService, postScope };
