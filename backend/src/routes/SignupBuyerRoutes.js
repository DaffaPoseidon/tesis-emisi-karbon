const express = require("express");
const { signupBuyer } = require("../controller/SignupBuyerController.js");

const router = express.Router();

router.post("/register", signupBuyer);

module.exports = router;