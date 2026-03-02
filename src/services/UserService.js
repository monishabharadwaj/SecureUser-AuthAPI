const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const User = require('../models/User');
const Address = require('../models/Address');
const Geo = require('../models/Geo');
const Company = require('../models/Company');

class UserService {

    async getAllUsers() {
        const query = `
            SELECT 
                u.id as user_id, u.name as user_name, u.username as user_username, 
                u.email as user_email, u.phone as user_phone, u.website as user_website,
                a.id as address_id, a.street as address_street, a.suite as address_suite,
                a.city as address_city, a.zipcode as address_zipcode,
                g.id as geo_id, g.lat as geo_lat, g.lng as geo_lng,
                c.id as company_id, c.name as company_name, 
                c.catch_phrase as company_catch_phrase, c.bs as company_bs
            FROM users u
            LEFT JOIN address a ON u.address_id = a.id
            LEFT JOIN geo g ON a.geo_id = g.id
            LEFT JOIN company c ON u.company_id = c.id
            ORDER BY u.id
        `;
        const [rows] = await pool.execute(query);
        return rows.map(row => User.fromDbRow(row));
    }

    async getUserById(id) {
        const query = `
            SELECT 
                u.id as user_id, u.name as user_name, u.username as user_username, 
                u.email as user_email, u.phone as user_phone, u.website as user_website,
                a.id as address_id, a.street as address_street, a.suite as address_suite,
                a.city as address_city, a.zipcode as address_zipcode,
                g.id as geo_id, g.lat as geo_lat, g.lng as geo_lng,
                c.id as company_id, c.name as company_name, 
                c.catch_phrase as company_catch_phrase, c.bs as company_bs
            FROM users u
            LEFT JOIN address a ON u.address_id = a.id
            LEFT JOIN geo g ON a.geo_id = g.id
            LEFT JOIN company c ON u.company_id = c.id
            WHERE u.id = ?
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows.length > 0 ? User.fromDbRow(rows[0]) : null;
    }

    async getUserWithPasswordByEmail(email) {
        const query = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await pool.execute(query, [email]);
        return rows.length > 0 ? rows[0] : null;
    }

    async existsByUsername(username) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE username = ?',
            [username]
        );
        return rows[0].count > 0;
    }

    async existsByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE email = ?',
            [email]
        );
        return rows[0].count > 0;
    }

    async createUser(userData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            if (await this.existsByUsername(userData.username)) {
                throw new Error('Username already exists');
            }

            if (await this.existsByEmail(userData.email)) {
                throw new Error('Email already exists');
            }

            if (!userData.password) {
                throw new Error("Password is required");
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            const user = new User(userData);
            const userValues = user.toDbValues();

            const [userResult] = await connection.execute(
                `INSERT INTO users 
                (name, username, email, password, phone, website) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    userValues.name,
                    userValues.username,
                    userValues.email,
                    hashedPassword,
                    userValues.phone,
                    userValues.website
                ]
            );

            await connection.commit();
            return await this.getUserById(userResult.insertId);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateUser(id, userData) {
        await pool.execute(
            'UPDATE users SET name = ?, username = ?, email = ?, phone = ?, website = ? WHERE id = ?',
            [
                userData.name,
                userData.username,
                userData.email,
                userData.phone,
                userData.website,
                id
            ]
        );

        return await this.getUserById(id);
    }

    async deleteUser(id) {
        await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    }

    // 🔐 Save refresh token
    async updateRefreshToken(userId, refreshToken) {
        await pool.execute(
            'UPDATE users SET refresh_token = ? WHERE id = ?',
            [refreshToken, userId]
        );
    }

    // 🔐 Get user by refresh token
    async getUserByRefreshToken(refreshToken) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE refresh_token = ?',
            [refreshToken]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    // 🔐 Remove refresh token (Logout)
    async removeRefreshToken(refreshToken) {
        await pool.execute(
            'UPDATE users SET refresh_token = NULL WHERE refresh_token = ?',
            [refreshToken]
        );
    }
}

module.exports = new UserService();