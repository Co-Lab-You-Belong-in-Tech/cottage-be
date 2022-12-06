const express = require("express");
const { userSignUp, userLogin } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", userSignUp);
router.post("/login", userLogin);

module.exports = router;
