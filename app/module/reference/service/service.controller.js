const { validationResult } = require("express-validator");
const prisma = require("../../../config/prismaClient");
const filterHandler = require("../../../utils/filterHandler");
const sortHandler = require("../../../utils/sortHandler");
const {
  konstantaAction,
  getMeasurementUnit,
} = require("../../../utils/konstanta");
const MSG = require("../../../utils/message");

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

    const currentPage = Number(page) || 1;
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

  if (!id)
    return res.status(400).json({ success: false, message: MSG.INVALID_ID });

  try {
    const data = await prisma.td_Service.findFirst({
      where: {
        id,
      },
      include,
    });

    if (!data)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getScopes = async (req, res, next) => {
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

    const currentPage = Number(page) || 1;
    const take = parseInt(limit);
    const skip = (currentPage - 1) * take;

    const [data, total] = await Promise.all([
      prisma.td_ServiceScope.findMany({
        include,
        orderBy: sorter,
        skip,
        take,
        where,
      }),

      prisma.td_ServiceScope.count({ where }),
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
      .status(400)
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
    res.status(201).json({ success: true, message: MSG.CREATED("Service") });
  } catch (error) {
    next(error);
  }
};

const postScope = async (req, res, next) => {
  const { serviceId, scopeList } = req.body;
  const user = req.user;

  const errorValidation = validationResult(req);

  if (!errorValidation.isEmpty())
    return res
      .status(400)
      .json({ success: false, message: errorValidation.array()[0].msg });

  try {
    const service = await prisma.td_Service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    await prisma.$transaction(async (tx) => {
      for (const item of scopeList) {
        const newScope = await tx.td_ServiceScope.create({
          data: {
            serviceId,
            scope: item.scope,
          },
        });

        await tx.th_ServiceScope.create({
          data: {
            serviceScopeId: newScope.id,
            action: konstantaAction.create,
            name: user?.name,
          },
        });
      }
    });

    res.status(201).json({ success: true, message: MSG.CREATED("Scope") });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ success: false, message: MSG.INVALID_ID });

  try {
    const service = await prisma.td_Service.findUnique({
      where: {
        id,
      },
      include,
    });

    if (!service)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < service.scope.length; i++) {
        const { id } = service.scope[i];

        await prisma.th_ServiceScope.deleteMany({
          where: {
            serviceScopeId: id,
          },
        });

        await prisma.td_ServiceScope.delete({
          where: {
            id,
          },
        });
      }

      await prisma.th_Service.deleteMany({
        where: {
          serviceId: service.id,
        },
      });

      await prisma.td_Service.delete({
        where: {
          id: service.id,
        },
      });
    });

    res.status(200).json({ success: true, message: MSG.DELETED("Service") });
  } catch (error) {
    next(error);
  }
};

const deleteScope = async (req, res, next) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ success: false, message: MSG.INVALID_ID });
  try {
    const scope = await prisma.td_ServiceScope.findUnique({
      where: {
        id,
      },
    });

    if (!scope)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    await prisma.$transaction(async (tx) => {
      await tx.th_ServiceScope.deleteMany({
        where: {
          serviceScopeId: scope.id,
        },
      });

      await tx.td_ServiceScope.delete({
        where: {
          id: scope.id,
        },
      });
    });

    res.status(200).json({ success: true, message: MSG.DELETED("Scope") });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getService,
  getServices,
  getScopes,
  postService,
  postScope,
  deleteService,
  deleteScope,
};
