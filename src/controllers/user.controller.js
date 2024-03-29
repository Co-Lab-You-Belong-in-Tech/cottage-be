const User = require("../models/user.model.js");
const Product = require("../models/product.model.js");
const Store = require("../models/store.model.js");

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

    const resetURL = process.env.NODE_ENV
      ? `http://localhost:3000/resetPassword/${resetToken}`
      : `https://cottage-fe.vercel.app/resetPassword/${resetToken}`;

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
    const { name, gender, country, city, dob, aboutHostSummary,image } = req.body;
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


    // const uploadResponse = await cloudinary.uploader.upload(req.file.path);

    // const profilePicture = uploadResponse.secure_url;

    // if (user.profilePictureCloudinaryId) {
    //   await cloudinary.uploader.destroy(user?.profilePictureCloudinaryId);
    // }
    // const public_id_ = uploadResponse.public_id;

    await User.findByIdAndUpdate(
      id,
      {
        name,
        gender,
        country,
        city,
        dob,
        role: "host",
        // profilePicture,
        aboutHostSummary,
        image
        // profilePictureCloudinaryId: public_id_,
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
    console.log("error in updateHostProfile");
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
      location,
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
        location &&
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
      location,
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
    next(error);
  }
};

// favorite a product
exports.favoriteProduct = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    const { productId } = req.params;

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

    if (user.role !== "user") {
      return errorResMsg(res, 400, "You are not a user");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResMsg(res, 400, "Invalid product id");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResMsg(res, 404, "Product not found");
    }

    // check if product is already in user's favorite list
    const isProductInFavoriteList = product.favorites.includes(user._id);
    if (isProductInFavoriteList) {
      return errorResMsg(res, 400, "Product already in favorite list");
    }

    // add product to user's favorite list
    await Product.findByIdAndUpdate(
      productId,
      {
        $push: { favorites: id },
      },
      {
        new: true,
      }
    );

    // add product to user's favorite list
    await User.findByIdAndUpdate(
      id,
      {
        $push: { productFavoritesList: productId },
      },
      {
        new: true,
      }
    );

    const dataInfo = {
      message: "Product added to favorite list",
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    next(error);
  }
};

// unfavorite a product
exports.unfavoriteProduct = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    const { productId } = req.params;

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

    if (user.role !== "user") {
      return errorResMsg(res, 400, "You are not a user");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return errorResMsg(res, 400, "Invalid product id");
    }

    const product = await Product.findById(productId);
    if (!product) {
      return errorResMsg(res, 404, "Product not found");
    }

    // check if product is already in user's favorite list
    const isProductInFavoriteList = product.favorites.includes(user._id);
    if (!isProductInFavoriteList) {
      return errorResMsg(res, 400, "Product not in favorite list");
    }

    // remove product from user's favorite list
    await Product.findByIdAndUpdate(
      productId,
      {
        $pull: { favorites: id },
      },
      {
        new: true,
      }
    );

    // remove product from user's favorite list
    await User.findByIdAndUpdate(
      id,
      {
        $pull: { productFavoritesList: productId },
      },
      {
        new: true,
      }
    );

    const dataInfo = {
      message: "Product removed from favorite list",
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    next(error);
  }
};

// search products by location
exports.searchProductsByLocation = async (req, res, next) => {
  try {
    const { location } = req.query;

    if (!location) {
      return errorResMsg(res, 400, "Please provide a location");
    }

    const products = await Product.find({
      location: { $regex: location, $options: "i" },
    }).populate("host", "firstName lastName");

    const dataInfo = {
      message: "Products found",
      products,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    next(error);
  }
};

// search products by food type
exports.searchProductsByFoodType = async (req, res, next) => {
  try {
    const { foodType } = req.query;

    if (!foodType) {
      return errorResMsg(res, 400, "Please provide a food type");
    }

    const products = await Product.find({
      foodType: { $regex: foodType, $options: "i" },
    }).populate("host", "firstName lastName");

    const dataInfo = {
      message: "Products found",
      products,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    next(error);
  }
};

// Searc products by favorites
exports.searchProductsByFavorites = async (req, res, next) => {
  try {
    const { _id: id } = req.user;

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

    if (user.role !== "user") {
      return errorResMsg(res, 400, "You are not a user");
    }

    const products = await Product.find({
      _id: { $in: user.productFavoritesList },
    }).populate("host", "firstName lastName");

    const dataInfo = {
      message: "Products found",
      products,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    next(error);
  }
};

// create a new store
exports.createStore = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    const { storeName, gender, city, country, dateOfBirth, about } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResMsg(res, 400, "Invalid id");
    }

    if (!(storeName && gender && city && country && dateOfBirth && about)) {
      return errorResMsg(res, 400, "Please provide all fields");
    }

    const user = await User.findById({ _id: id });
    console.log(id);

    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    if (user.role !== "host") {
      return errorResMsg(res, 400, "You are not a host");
    }

    // upload images to cloudinary
    const images = [];
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path);
        images.push(result.secure_url);
      }
    }

    const store = await Store.create({
      storeName,
      images: images,
      gender,
      city,
      country,
      dateOfBirth,
      about,
      host: user._id,
    });

    const dataInfo = {
      message: "Store created",
      store,
    };

    return successResMsg(res, 201, dataInfo);
  } catch (error) {
    next(error);
  }
};


// get all stores
exports.getAllStores = async (req, res, next) => {
  try {
    const stores = await Store.find().populate("host", "firstName lastName");

    const dataInfo = {
      message: "Stores found",
      stores,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    next(error);
  }
};

// get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("host", "firstName lastName");

    const dataInfo = {
      message: "Products found",
      products,
    };

    return successResMsg(res, 200, dataInfo);
  } catch (error) {
    next(error);
  }
};

// favorite a store
exports.favoriteStore = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    const { storeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResMsg(res, 400, "Invalid id");
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return errorResMsg(res, 400, "Invalid store id");
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    if (user.role !== "user") {
      return errorResMsg(res, 400, "You are not a user");
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return errorResMsg(res, 404, "Store not found");
    }

   // check if store is already in favorites list
    const storeIndex = user.storeFavoritesList.indexOf(storeId);
    if (storeIndex !== -1) {
      return errorResMsg(res, 400, "Store already in favorites list");
    }

    // add store to user favorites list
    await Store.findByIdAndUpdate(
      storeId,
      { $push: { favorites: id } },
    );

    // add store to user favorites list
    await User.findByIdAndUpdate(
      id,
      { $push: { storeFavoritesList: storeId } },
    );

    const dataInfo = {
      message: "Store added to favorites list",
    };

    return successResMsg(res, 200, dataInfo);

  } catch (error) {
    next(error);
  }
};

// unfavorite a store
exports.unfavoriteStore = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    const { storeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResMsg(res, 400, "Invalid id");
    }

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return errorResMsg(res, 400, "Invalid store id");
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResMsg(res, 404, "User not found");
    }

    if (user.role !== "user") {
      return errorResMsg(res, 400, "You are not a user");
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return errorResMsg(res, 404, "Store not found");
    }

    // check if store is in favorites list
    const storeIndex = user.storeFavoritesList.indexOf(storeId);
    if (storeIndex === -1) {
      return errorResMsg(res, 400, "Store not in favorites list");
    }

    // remove store from user favorites list
    await Store.findByIdAndUpdate(
      storeId,
      { $pull: { favorites: id } },
    );

    // remove store from user favorites list
    await User.findByIdAndUpdate(
      id,
      { $pull: { storeFavoritesList: storeId } },
    );

    const dataInfo = {
      message: "Store removed from favorites list",
    };

    return successResMsg(res, 200, dataInfo);

  } catch (error) {
    next(error);
  }
};


