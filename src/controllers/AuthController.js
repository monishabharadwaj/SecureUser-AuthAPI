const bcrypt = require('bcryptjs');
const userService = require('../services/UserService');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const jwt = require('jsonwebtoken');

class AuthController {

    async register(req, res) {
        try {
            const { password } = req.body;

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
                });
            }

            const user = await userService.createUser(req.body);

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await userService.updateRefreshToken(user.id, refreshToken);

            res.status(201).json({
                message: "User registered successfully",
                accessToken,
                refreshToken,
                user
            });

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            const user = await userService.getUserWithPasswordByEmail(email);

            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            delete user.password;

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await userService.updateRefreshToken(user.id, refreshToken);

            res.json({
                message: "Login successful",
                accessToken,
                refreshToken,
                user
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({ message: "Refresh token required" });
            }

            const user = await userService.getUserByRefreshToken(refreshToken);

            if (!user) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);

            await userService.updateRefreshToken(user.id, newRefreshToken);

            res.json({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });

        } catch (error) {
            res.status(403).json({ message: "Invalid or expired refresh token" });
        }
    }

    async logout(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ message: "Refresh token required" });
            }

            await userService.removeRefreshToken(refreshToken);

            res.json({ message: "Logged out successfully" });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new AuthController();