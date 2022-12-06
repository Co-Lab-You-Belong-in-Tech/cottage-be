require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/db");

const authRoutes = require("./routes/auth.routes");

const app = express();
const port = process.env.PORT || 3456;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
