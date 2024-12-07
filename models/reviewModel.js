import pool from "../database/db.js";

export const createReview = async (filmId, userId, rating, reviewText) => {
  const query = `
    INSERT INTO reviews (film_id, user_id, rating, review_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [filmId, userId, rating, reviewText];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getReviewsByFilmId = async (filmId) => {
  const query =
    "SELECT * FROM reviews WHERE film_id = $1 ORDER BY created_at DESC";
  const result = await pool.query(query, [filmId]);
  return result.rows;
};
