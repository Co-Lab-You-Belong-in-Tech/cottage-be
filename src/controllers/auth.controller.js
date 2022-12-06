const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// User SignUp
exports.userSignUp = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, location, email, password } =
      req.body;

    // Validate inputs
    if (
      !(firstName && lastName && phoneNumber && location && email && password)
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Please fill all fields",
      });
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
    });

    return res.status(201).json({
      status: "success",
      message: "User created successfully",
    });
  } catch (error) {
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
