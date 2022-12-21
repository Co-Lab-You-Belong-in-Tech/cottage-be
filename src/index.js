require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/db");
const globalErrorHandler = require("./errors/errorHandler");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const app = express();
const port = process.env.PORT || 3456;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World! --- Welcome to Cottage Backers");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

// Global Error Handler
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
