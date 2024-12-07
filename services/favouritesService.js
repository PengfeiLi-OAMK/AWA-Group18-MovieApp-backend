import pool from '../database/db.js';

const addFavourite = async (userId, movieId) => {
    const query = `
        INSERT INTO favourites (user_id, movie_id)
        VALUES ($1, $2)
        RETURNING *;
    `;
    const values = [userId, movieId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getFavouritesByUserId = async (userId) => {
    const query = `
        SELECT * FROM favourites WHERE user_id = $1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

const deleteFavourite = async (userId, movieId) => {
    const query = `
        DELETE FROM favourites
        WHERE user_id = $1 AND movie_id = $2
        RETURNING *;
    `;
	const values = [userId, movieId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

export default {
    addFavourite,
    getFavouritesByUserId,
    deleteFavourite,
};
