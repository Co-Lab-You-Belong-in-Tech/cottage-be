const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

const dbUrl = process.env.NODE_ENV == "development" ? "mongodb://127.0.0.1:27017/cottage_dev" : MONGO_URI;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(dbUrl);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;
