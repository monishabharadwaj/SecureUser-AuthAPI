const jwt = require("jsonwebtoken");

// 🔐 Access Token (Short lived)
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
};

// 🔐 Refresh Token (Long lived)
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
};