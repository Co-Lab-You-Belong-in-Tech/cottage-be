const express = require("express");
const {
  userSignUp,
  userLogin,
  verifyEmail,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", userSignUp);
router.post("/login", userLogin);
router.get("/verify-email", verifyEmail);

module.exports = router;
