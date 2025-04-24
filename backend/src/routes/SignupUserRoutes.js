const express = require("express");
const { signupUser } = require("../controller/SignupUserController.js");

const router = express.Router();

router.post("/register", signupUser);

module.exports = router;