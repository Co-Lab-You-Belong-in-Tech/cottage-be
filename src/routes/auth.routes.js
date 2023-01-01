const express = require("express");
const {
  userSignUp,
  userLogin,
  verifyEmail,
  switchUserToHost,
} = require("../controllers/auth.controller");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const router = express.Router();

router.post("/register", userSignUp);
router.post("/login", userLogin);
router.get("/verify-email/:token", verifyEmail);
router.put("/switch-to-host", isAuthenticated, switchUserToHost);

module.exports = router;
