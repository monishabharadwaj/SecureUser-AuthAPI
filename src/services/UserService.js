const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const User = require('../models/User');

class UserService {

    // ===========================
    // GET ALL USERS
    // ===========================
    async getAllUsers() {
        const [rows] = await pool.execute(`
            SELECT id, name, username, email, role, phone, website, created_at, updated_at
            FROM users
            ORDER BY id
        `);
        return rows;
    }

    // ===========================
    // GET USER BY ID
    // ===========================
    async getUserById(id) {
        const [rows] = await pool.execute(
            `SELECT id, name, username, email, role, phone, website, created_at, updated_at
             FROM users WHERE id = ?`,
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    // ===========================
    // GET USER WITH PASSWORD (FOR LOGIN)
    // ===========================
    async getUserWithPasswordByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    // ===========================
    // CHECK IF USERNAME EXISTS
    // ===========================
    async existsByUsername(username) {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM users WHERE username = ?`,
            [username]
        );
        return rows[0].count > 0;
    }

    // ===========================
    // CHECK IF EMAIL EXISTS
    // ===========================
    async existsByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM users WHERE email = ?`,
            [email]
        );
        return rows[0].count > 0;
    }

    // ===========================
    // CREATE USER (FIXED VERSION)
    // ===========================
    async createUser(userData) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Generate username if not provided
            const username = userData.username || userData.email.split('@')[0];

            if (await this.existsByUsername(username)) {
                throw new Error('Username already exists');
            }

            if (await this.existsByEmail(userData.email)) {
                throw new Error('Email already exists');
            }

            if (!userData.password) {
                throw new Error('Password is required');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Ensure role
            const role = userData.role ? userData.role.toLowerCase() : 'user';

            const [result] = await connection.execute(
                `INSERT INTO users
                (name, username, email, password, role, phone, website, address_id, company_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userData.name,
                    username,
                    userData.email,
                    hashedPassword,
                    role,
                    null,  // phone
                    null,  // website
                    null,  // address_id
                    null   // company_id
                ]
            );

            await connection.commit();
            return await this.getUserById(result.insertId);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // ===========================
    // UPDATE USER
    // ===========================
    async updateUser(id, userData) {
        await pool.execute(
            `UPDATE users 
             SET name = ?, username = ?, email = ?, phone = ?, website = ?
             WHERE id = ?`,
            [
                userData.name,
                userData.username,
                userData.email,
                userData.phone || null,
                userData.website || null,
                id
            ]
        );

        return await this.getUserById(id);
    }

    // ===========================
    // DELETE USER
    // ===========================
    async deleteUser(id) {
        await pool.execute(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );
    }

    // ===========================
    // REFRESH TOKEN METHODS
    // ===========================
    async updateRefreshToken(userId, refreshToken) {
        await pool.execute(
            `UPDATE users SET refresh_token = ? WHERE id = ?`,
            [refreshToken, userId]
        );
    }

    async getUserByRefreshToken(refreshToken) {
        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE refresh_token = ?`,
            [refreshToken]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    async removeRefreshToken(refreshToken) {
        await pool.execute(
            `UPDATE users SET refresh_token = NULL WHERE refresh_token = ?`,
            [refreshToken]
        );
    }
}

module.exports = new UserService();