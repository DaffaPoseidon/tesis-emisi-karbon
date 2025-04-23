const express = require("express");
const { signupValidator } = require("../controller/SignupValidatorController.js");

const router = express.Router();

router.post("/register", signupValidator);

module.exports = router;