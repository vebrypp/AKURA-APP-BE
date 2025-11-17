const { validationResult } = require("express-validator");
const prisma = require("../../../config/prismaClient");
const filterHandler = require("../../../utils/filterHandler");
const sortHandler = require("../../../utils/sortHandler");
const { konstantaAction } = require("../../../utils/konstanta");
const MSG = require("../../../utils/message");

const include = {
  description: true,
};

const includeDescription = {
  service: true,
  scope: true,
};

const getDescriptions = async (req, res, next) => {
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
      prisma.td_ServiceDescription.findMany({
        include: includeDescription,
        orderBy: sorter,
        skip,
        take,
        where,
      }),

      prisma.td_ServiceDescription.count({ where }),
    ]);

    const newData = data.map(({ scope, ...descriptionData }) => {
      const scopeArray = scope.map((dataScope) => dataScope.scope);
      return {
        ...descriptionData,
        scope: scopeArray.join(", "),
      };
    });

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: currentPage,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      data: newData,
    });
  } catch (error) {
    next(error);
  }
};

const getDescription = async (req, res, next) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ success: false, message: MSG.INVALID_ID });

  try {
    const data = await prisma.td_ServiceDescription.findFirst({
      where: {
        id,
      },
      include: includeDescription,
    });

    if (!data)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getServiceOption = async (req, res, next) => {
  try {
    const data = await prisma.td_Service.findMany();

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
  const { service, description, scopes } = req.body;
  const user = req.user;

  const errorValidation = validationResult(req);

  if (!errorValidation.isEmpty())
    return res
      .status(400)
      .json({ success: false, message: errorValidation.array()[0].msg });

  try {
    await prisma.$transaction(async (tx) => {
      const newService = await tx.td_Service.create({
        data: {
          service,
        },
      });

      await tx.th_Service.create({
        data: {
          serviceId: newService.id,
          name: user?.name,
          action: konstantaAction.create,
        },
      });

      const newDescription = await tx.td_ServiceDescription.create({
        data: {
          serviceId: newService.id,
          description: description.toUpperCase(),
        },
      });

      await tx.th_ServiceDescription.create({
        data: {
          descriptionId: newDescription.id,
          name: user?.name,
          action: konstantaAction.create,
        },
      });

      for (const scope of scopes) {
        const newScope = await tx.td_ServiceScope.create({
          data: {
            descriptionId: newDescription.id,
            scope: scope.scope.toUpperCase(),
          },
        });

        await tx.th_ServiceScope.create({
          data: {
            scopeId: newScope.id,
            name: user?.name,
            action: konstantaAction.create,
          },
        });
      }
    });
    res.status(201).json({ success: true, message: MSG.CREATED("Service") });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const postScope = async (req, res, next) => {
  const { descriptionId, scopes } = req.body;
  const user = req.user;

  console.log(req.body);

  const errorValidation = validationResult(req);

  if (!errorValidation.isEmpty())
    return res
      .status(400)
      .json({ success: false, message: errorValidation.array()[0].msg });

  try {
    const description = await prisma.td_ServiceDescription.findUnique({
      where: {
        id: descriptionId,
      },
    });

    if (!description)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    await prisma.$transaction(async (tx) => {
      for (const item of scopes) {
        const newScope = await tx.td_ServiceScope.create({
          data: {
            descriptionId: description.id,
            scope: item.scope,
          },
        });

        await tx.th_ServiceScope.create({
          data: {
            scopeId: newScope.id,
            action: konstantaAction.create,
            name: user?.name,
          },
        });
      }
    });

    res.status(201).json({ success: true, message: MSG.CREATED("Scope") });
  } catch (error) {
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

    await prisma.$transaction(async (tx) => {});

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
          scopeId: scope.id,
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
  getDescription,
  getDescriptions,
  getServiceOption,
  getScopes,
  postService,
  postScope,
  deleteService,
  deleteScope,
};
