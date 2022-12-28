const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    foodType: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: Array,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    deliveryOption: {
      type: String,
    },
    productDescription: {
      type: String,
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
