const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

const dbUrl = MONGO_URI;

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
