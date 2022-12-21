const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const sendEmail = require("../utils/email");
const welcomeTemplate = require("../utils/template/welcome");
const crypto = require("crypto");
const { successResMsg, errorResMsg } = require("../lib/response");




// User SignUp
exports.userSignUp = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, location, email, password } =
      req.body;

    // Validate inputs
    if (
      !(firstName && lastName && phoneNumber && location && email && password)
    ) {
     return errorResMsg(res, 400, "Please fill all fields")
    }

    const checkExistingUser = await User.findOne({ email });
    if (checkExistingUser) {
      return res.status(409).json({
        status: "fail",
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      phoneNumber,
      location,
      email,
      password: hashedPassword,
      emailToken: crypto.randomBytes(64).toString("hex"),
    });

    let URL = process.env.CLIENT_URL;

    // send email
    const options = {
      email,
      subject: "Welcome to the team",
      html: await welcomeTemplate(URL, user.firstName, user.emailToken),
    };

    await sendEmail(options);

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

// User login
exports.userLogin = async (req, res) => {
  const { password, email } = req.body;
  try {
    //Validate input
    if (!(email && password)) {
      return res.status(400).json({
        status: "fail",
        message: "Please fill all fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User does not exists",
      });
    }

    // validate and verify is user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        status: "fail",
        message: "User not verified",
      });
    }

    // match user password
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid credentials",
      });
    }

    // Implement access-token
    const access_token = await jwt.sign(
      { _id: user._id, email },
      process.env.USER_JWT_TOKEN,
      {
        expiresIn: "2h",
      }
    );

    return res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// Verify user email
exports.verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    const user = await User.findOne({
      emailToken: token,
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid token",
      });
    }

    user.emailToken = undefined;
    user.isVerified = true;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
};

// switch to host
exports.switchUserToHost = async (req, res, next) => {
  try {
    const { _id: id } = req.user;

    // validate id with mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid id",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    user.role = "host";
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "User switched to host",
    });
  } catch (error) {
    next(error);
  }
};

