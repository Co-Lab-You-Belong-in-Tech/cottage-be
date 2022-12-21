const express = require("express");
const {
  updateHostProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { upload } = require("../utils/cloudinary");
const router = express.Router();

router.put(
  "/update-host-profile",
  upload.single("image"),
  isAuthenticated,
  updateHostProfile
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
