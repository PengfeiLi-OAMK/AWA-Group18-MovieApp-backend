import pool from '../database/db.js';

const addWatchlistItem = async (userId, movieId) => {
    const query = `
        INSERT INTO watchlist (user_id, movie_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [userId, movieId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getWatchlistByUserId = async (userId, limit = null) => {
    const query = limit
        ? `SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC LIMIT $2;`
        : `SELECT * FROM watchlist WHERE user_id = $1;`;
    const values = limit ? [userId, limit] : [userId];
    const result = await pool.query(query, values);
    return result.rows;
};

const deleteWatchlistItem = async (userId, movieId) => {
    const query = `
        DELETE FROM watchlist
        WHERE user_id = $1 AND movie_id = $2
        RETURNING *;
    `;
    const values = [userId, movieId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export default {
    addWatchlistItem,
    getWatchlistByUserId,
    deleteWatchlistItem,
};
