const prisma = require("../../config/prismaClient");
const filterHandler = require("../../utils/filterHandler");
const sortHandler = require("../../utils/sortHandler");

const MSG = require("../../utils/message");
const {
  konstantaAction,
  getInquiryMethod,
  getTitleCustomer,
} = require("../../utils/konstanta");
const { formatDate } = require("../../utils/format");

const actionDetail = {
  quotation: "Quotation",
  service: "Quotation - Service",
  item: "Quotation - Item",
};

const include = {
  quotation: {
    staff: {
      include: {
        company: true,
      },
    },
    service: {
      include: {
        item: true,
        description: {
          include: {
            service: true,
          },
        },
      },
    },
    user: true,
  },
  description: {
    description: {
      include: { service: true, items: true },
    },
    item: true,
  },
  item: {
    quotationDescription: true,
  },
};

const getQuotations = async (req, res, next) => {
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
      prisma.td_Quotation.findMany({
        include: include.quotation,
        orderBy: sorter,
        skip,
        take,
        where,
      }),

      prisma.td_Quotation.count({ where }),
    ]);

    const newData = data.map(
      ({ date, inquiryDate, inquiryMethod, ...item }) => ({
        ...item,
        date: formatDate(date),
        inquiryDate: formatDate(inquiryDate),
        inquiryMethod: getInquiryMethod(inquiryMethod),
      })
    );

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

const getQuotation = async (req, res, next) => {
  const { id } = req.params;

  if (!id)
    return res.status(409).json({ success: false, message: MSG.INVALID_ID });
  try {
    const data = await prisma.td_Quotation.findUnique({
      include: include.quotation,
      where: { id },
    });

    if (!data)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    const quotation = {
      id: data.id,
      no: data.no,
      date: formatDate(data.date),
      customer: `${getTitleCustomer(data.staff.title)} ${data.staff.name}`,
      company: data.staff.company.company,
      companyAddress: data.staff.company.address,
      inquiryMethod: getInquiryMethod(data.inquiryMethod),
      inquiryDate: formatDate(data.inquiryDate),
      subject: data.subject,
      termOfPayment: data.termOfPayment,
      validity: data.validity,
      tax: data.tax,
      supplyAkura: data.supplyAkura,
      supplyCustomer: data.supplyCustomer,
      location: data.location,
      accomplished: data.accomplished,
      deliveryReports: data.deliveryReports,
      services: data.service,
      preparedBy: data.user.name,
    };

    res.status(200).json({ success: true, data: quotation });
  } catch (error) {
    next();
  }
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
      prisma.td_QuotationDescription.findMany({
        include: include.description,
        orderBy: sorter,
        skip,
        take,
        where,
      }),

      prisma.td_QuotationDescription.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: currentPage,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

const postQuotation = async (req, res, next) => {
  const {
    inquiryMethod,
    inquiryDate,
    subject,
    termOfPayment,
    validity,
    tax,
    supplyAkura,
    supplyCustomer,
    location,
    accomplished,
    deliveryReports,
    staffId,
    services,
  } = req.body;
  const user = req.user;

  try {
    await prisma.$transaction(async (tx) => {
      const newQuotation = await tx.td_Quotation.create({
        data: {
          inquiryMethod,
          inquiryDate,
          subject: subject.toUpperCase(),
          termOfPayment: termOfPayment.toUpperCase(),
          validity: validity.toUpperCase(),
          tax,
          supplyAkura: supplyAkura.toUpperCase(),
          supplyCustomer: supplyCustomer.toUpperCase(),
          location: location.toUpperCase(),
          accomplished: accomplished.toUpperCase(),
          deliveryReports: deliveryReports.toUpperCase(),
          staffId,
          userId: user?.id,
        },
      });

      await tx.th_Quotation.create({
        data: {
          quotationId: newQuotation.id,
          action: konstantaAction.create,
          actionDetail: actionDetail.quotation,
          user: user?.name,
        },
      });

      for (const service of services) {
        await tx.td_QuotationDescription.create({
          data: {
            quotationId: newQuotation.id,
            descriptionId: service.id,
          },
        });
      }
    });

    res.status(201).json({ success: true, message: MSG.CREATED });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const postQuotataionItem = async (req, res, next) => {
  const { descriptionItemId, name, quantity, quotationDescriptionId } =
    req.body;

  try {
    const descriptionItem = await prisma.td_ServiceDescriptionItem.findUnique({
      where: {
        id: descriptionItemId,
      },
    });

    if (!descriptionItem)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    await prisma.$transaction(async (tx) => {
      await tx.td_QuotationDescriptionItem.create({
        data: {
          quotationDescriptionId,
          name,
          quantity,
          price: descriptionItem.basePrice,
          totalPrice: descriptionItem.basePrice,
        },
      });
    });

    res
      .status(201)
      .json({ success: true, message: MSG.CREATED("Quotation item") });
  } catch (error) {
    next(error);
  }
};

const deleteQuotation = async (req, res, next) => {
  const { id } = req.params;

  if (!id)
    return res.status(400).json({ success: false, message: MSG.INVALID_ID });

  try {
    const quotation = await prisma.td_Quotation.findUnique({
      where: {
        id,
      },
    });

    if (!quotation)
      return res.status(404).json({ success: false, message: MSG.NOT_FOUND });

    await prisma.$transaction(async (tx) => {
      await tx.td_QuotationDescription.deleteMany({
        where: {
          quotationId: quotation.id,
        },
      });

      await tx.th_Quotation.deleteMany({
        where: {
          quotationId: quotation.id,
        },
      });

      await tx.td_Quotation.delete({
        where: {
          id: quotation.id,
        },
      });
    });

    res.status(200).json({ success: true, message: MSG.DELETED("Quotataion") });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuotations,
  getQuotation,
  getDescriptions,
  postQuotation,
  postQuotataionItem,
  deleteQuotation,
};
