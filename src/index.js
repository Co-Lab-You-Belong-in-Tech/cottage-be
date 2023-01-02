require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./database/db");
const globalErrorHandler = require("./errors/errorHandler");
const { logger } = require("./logger/logger");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();
const port = process.env.PORT || 3456;

connectDB();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.send("Hello World! --- Welcome to Cottage Bakers");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// Global Error Handler
app.use(globalErrorHandler);

app.listen(port, () => {
  logger.info(`Server is running on port http://localhost:${port}`);
});
