const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: Array,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Others", "Rather not say"],
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    about: {
      type: String,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.model("Store", storeSchema);

module.exports = Store;
