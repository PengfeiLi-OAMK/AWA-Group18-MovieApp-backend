import pool from '../database/db.js';
import bcrypt from 'bcrypt';

const UserModel = {
    async createUser(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
        const values = [username, email, hashedPassword];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async findUserByEmail(email) {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const { rows } = await pool.query(query, [email]);
            return rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error; 
        }
    }
    
};

export default UserModel;
