const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const authRoute = require("./module/auth/auth.route");
const companyRoute = require("./module/reference/company/company.route");
const serviceRoute = require("./module/reference/service/service.route");
const quotationRoute = require("./module/quotation/quotation.route");

const app = express();

dotenv.config();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/service", serviceRoute);
app.use("/api/v1/quotation", quotationRoute);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
