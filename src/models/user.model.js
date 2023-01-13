const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    dob: {
      type: Date,
    },
    aboutHostSummary: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },
    emailToken: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin", "host"],
      default: "user",
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "rather not say"],
      default: "male",
    },
    location: {
      type: String,
      trim: true,
    },

    dob: {
      type: Date,
    },
    profilePicture: {
      type: String,
    },
    profilePictureCloudinaryId: {
      type: String,
    },
    aboutHostSummary: {
      type: String,
    },
    productFavoritesList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    storeFavoritesList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// createPasswordResetToken
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};



const User = mongoose.model("User", userSchema);

module.exports = User;
