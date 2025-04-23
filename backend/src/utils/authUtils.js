const jwt = require("jsonwebtoken")
const secretKey = require("../configuration/jwtConfig")

function generateToken(user) {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    }
    return jwt.sign(payload, secretKey.secretKey, { expiresIn: "1h" })
    // return jwt.sign(payload, secretKey, { expiresIn: "1h" })
}

function generateRefreshToken(user) {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    }
    return jwt.sign(payload, secretKey, { expiresIn: "7h" })
}

function verifyToken(token) {
    try {
        return jwt.verify(token, secretKey.secretKey); // Verifikasi token dengan kunci rahasia
    } catch (err) {
        throw new Error("Invalid token"); // Tangani error
    }
}

module.exports = { generateToken, generateRefreshToken, verifyToken}
