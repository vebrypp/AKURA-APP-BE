const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");
const authRoute = require("./module/auth/auth.route");

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

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
