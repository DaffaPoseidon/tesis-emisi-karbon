const jwt = require("jsonwebtoken")
const { secretKey } = require("../configuration/jwtConfig")

function authenticateToken(req, res, next) {
    const authHeader = req.header("Authorization")
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized: Missing token" })
    }

    const [bearer, token] = authHeader.split(" ")
    console.log('Bearer Akun:', bearer);
    console.log('Token Akun:', token);
    
    if (bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "Unauthorized: Missing Token" })
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.log("🚀 ~ jwt verification error:", err.message)
            return res.status(403).json({ message: "Forbidden: Invalid token format" })
        }
        req.user = user;
        next()
    })
}

module.exports = { authenticateToken }