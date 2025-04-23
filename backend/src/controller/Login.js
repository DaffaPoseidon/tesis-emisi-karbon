const bcrypt = require("bcrypt")
const User = require("../models/User")
const { generateToken, verifyToken, generateRefreshToken } = require("../utils/authUtils")

async function login(req, res) {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            throw new Error("User not found")
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            throw new Error("Invalid password")
        }
        const token = generateToken(user)
        res.status(200).json({ user: user, token: token })
    } catch (error) {
        res.status(401).json({ message: "Invalid credentials" })
    }
}

async function refreshToken(req, res) {
    try {
        const {oldToken} = req.body
        const decodedToken = verifyToken(oldToken)
        const existingUser = await User.findById(decodedToken.id)
        if(!existingUser) {
            throw new Error("User not found")
        }
        const newToken = generateRefreshToken(existingUser)
        // res.json({token: newToken})
        res.status(200).json({ token: newToken });
    } catch (error) {
        console.error("Error in refreshToken:", error.message); // Log error untuk debugging
        res.status(401).json({ message: "Invalid token" })
    }
}

module.exports = { login, refreshToken }