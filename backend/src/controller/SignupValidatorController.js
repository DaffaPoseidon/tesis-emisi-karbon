const User = require("../models/User");
const bcrypt = require("bcrypt");

async function signupValidator(req, res) {
    try {
        const { firstName, lastName, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: "validator"
        })
        const savedUser = await newUser.save();
        res.status(201).json({ message: "A validator created successfully", user: savedUser });
    } catch (error) {
        res.status(400).json({ message: error.message || "An error occurred during signup" });
        // res.status(400).json({ message: message.error }); 
    }
}

module.exports = { signupValidator };