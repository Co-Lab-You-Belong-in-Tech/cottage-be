const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { cloudinary } = require("../utils/cloudinary");
const { errorResMsg, successResMsg } = require("../lib/response.js");
const sendEmail = require("../utils/email.js");
const jwt = require("jsonwebtoken");

// forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResMsg(res, 400, "Please provide your email");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;

    const options = {
      email,
      subject: "Your password reset token (valid for 10 minutes)",
      message: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`,
      html: ` Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`,
    };

    await sendEmail(options);

    const dataInfo = {
      message: "Token sent to email",
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    return errorResMsg(res, 400, error.message);
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResMsg(res, 400, "Token is invalid");
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    user.password = hashedPassword;
    user.passwordConfirm = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.USER_JWT_TOKEN, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const dataInfo = {
      status: "success",
      token,
    };
    return res.status(200).json(dataInfo);
  } catch (error) {
    return errorResMsg(res, 400, error.message);
  }
};

// update host profile
exports.updateHostProfile = async (req, res, next) => {
  try {
    const { gender, city, country, dob, aboutHostSummary } = req.body;
    const { _id: id } = req.user;

    if (id === null && id === "44") {
      return errorResMsg(res, 400, "Please provide a valid id");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResMsg(res, 400, "Invalid id");
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    if (user.role !== "host") {
      return errorResMsg(res, 400, "You are not a host");
    }

    const uploadResponse = await cloudinary.uploader.upload(req.file.path);

    const profilePicture = uploadResponse.secure_url;

    if (user.profilePictureCloudinaryId) {
      await cloudinary.uploader.destroy(user?.profilePictureCloudinaryId);
    }
    const public_id_ = uploadResponse.public_id;

    await User.findByIdAndUpdate(
      id,
      {
        gender,
        city,
        country,
        dob,
        profilePicture,
        aboutHostSummary,
        profilePictureCloudinaryId: public_id_,
      },
      {
        new: true,
      }
    );
    const dataInfo = {
      status: "success",
      message: "Profile updated successfully",
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Create a product if you are a host
exports.createProduct = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    const {
      foodType,
      productName,
      price,
      city,
      country,
      deliveryOption,
      productDescription,
      experienceLevel,
    } = req.body;

    // validate input
    if (
      !(
        foodType &&
        productName &&
        price &&
        city &&
        country &&
        deliveryOption &&
        productDescription &&
        experienceLevel
      )
    ) {
      return errorResMsg(res, 400, "Please provide all required fields");
    }

    if (id === null && id === "") {
      return errorResMsg(res, 400, "Please provide a valid id");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResMsg(res, 400, "Invalid id");
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    if (user.role !== "host") {
      return errorResMsg(res, 400, "You are not a host");
    }

    // upload multiple images to cloudinary
    const files = req.files;
    const images = [];
    for (const file of files) {
      const uploadResponse = await cloudinary.uploader.upload(file.path);
      images.push(uploadResponse.secure_url);
    }

    const product = await Product.create({
      foodType,
      productName,
      price,
      city,
      country,
      deliveryOption,
      productDescription,
      experienceLevel,
      images,
      host: id,
    });


    const dataInfo = {
      status: "success",
      message: "Product created successfully",
    };

    return successResMsg(res, 201, dataInfo);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
