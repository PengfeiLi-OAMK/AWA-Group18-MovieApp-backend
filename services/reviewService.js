import pool from "../database/db.js";

export const addReview = async (film_id, user_id, rating, review_text) => {
  const query = `
    INSERT INTO reviews (film_id, user_id, rating, review_text)
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [film_id, user_id, rating, review_text];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getReviewsByFilmId = async (film_id) => {
  const query = `SELECT * FROM reviews WHERE film_id = $1 ORDER BY created_at DESC;`;
  const result = await pool.query(query, [film_id]);
  return result.rows;
};

export const deleteReviewById = async (id) => {
  const query = `DELETE FROM reviews WHERE id = $1;`;
  await pool.query(query, [id]);
};
