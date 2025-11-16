const prisma = require("../../config/prismaClient");
const filterHandler = require("../../utils/filterHandler");
const sortHandler = require("../../utils/sortHandler");

const MSG = require("../../utils/message");
const { validationResult } = require("express-validator");
const { konstantaAction, getInquiryMethod } = require("../../utils/konstanta");
const { formatDate } = require("../../utils/format");

const include = {
  staff: {
    include: {
      company: true,
    },
  },
  user: true,
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
        include,
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

const postQuotation = async (req, res, next) => {
  const {
    no,
    date,
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
  console.log(req.body);
  const user = req.user;

  const errorValidation = validationResult(req);

  if (!errorValidation.isEmpty())
    return res
      .status(400)
      .json({ success: false, message: errorValidation.array()[0].msg });

  try {
    await prisma.$transaction(async (tx) => {
      const newQuotation = await tx.td_Quotation.create({
        data: {
          no: no.toUpperCase(),
          date,
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
          name: user?.name,
        },
      });

      for (const service of services) {
        await tx.td_QuotationService.create({
          data: {
            quotationId: newQuotation.id,
            serviceId: service.id,
          },
        });
      }
    });

    res.status(201).json({ success: true, message: MSG.CREATED });
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
      await tx.td_QuotationService.deleteMany({
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
  postQuotation,
  deleteQuotation,
};
