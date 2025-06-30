const User = require("../models/User");
const bcrypt = require("bcrypt");

async function signupUser(req, res) {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        
        // Validasi role
        const validRoles = ["seller", "buyer", "guest"];
        const userRole = validRoles.includes(role) ? role : "guest";
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: userRole // Gunakan role dari request
        })
        const savedUser = await newUser.save();
        res.status(201).json({ message: "A user created successfully", user: savedUser });
    } catch (error) {
        res.status(400).json({ message: error.message || "An error occurred during signup" });
    }
}

module.exports = { signupUser };