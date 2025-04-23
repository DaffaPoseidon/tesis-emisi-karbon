const express = require("express");
const { signupSeller } = require("../controller/SignupSellerController.js");

const router = express.Router();

router.post("/register", signupSeller);

module.exports = router;