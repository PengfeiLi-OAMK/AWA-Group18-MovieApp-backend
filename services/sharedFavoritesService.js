import pool from '../database/db.js';

import { v4 as uuidv4 } from 'uuid';


// Fetch shared favorites by shared_id
 const fetchSharedFavorites = async (sharedId) => {
  const query = `
    SELECT movie_id FROM favourites
    WHERE user_id = (SELECT user_id FROM shared_favorites WHERE shared_id = $1)
  `;
  const { rows } = await pool.query(query, [sharedId]);
  return rows.map((row) => row.movie_id);
};

// Create or retrieve a shared_id for a user
const createOrGetSharedId = async (userId) => {
  try {
    const existingQuery = `
      SELECT shared_id FROM shared_favorites WHERE user_id = $1
    `;
    const existingResult = await pool.query(existingQuery, [userId]);

    if (existingResult.rows.length > 0) {
      return existingResult.rows[0].shared_id;
    }

    const sharedId = uuidv4();
    const insertQuery = `
      INSERT INTO shared_favorites (user_id, shared_id) VALUES ($1, $2)
    `;
    await pool.query(insertQuery, [userId, sharedId]);

    return sharedId;
  } catch (error) {
    console.error('Error creating or fetching shared_id:', error);
    throw new Error('Failed to create or fetch shared_id');
  }
};
export default {
  fetchSharedFavorites,
  createOrGetSharedId,
};