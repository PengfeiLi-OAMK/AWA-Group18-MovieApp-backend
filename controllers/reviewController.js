import pool from "../database/db.js";

export const getReviews = async (req, res) => {
  const { film_id } = req.params;
  const { user_id } = req.query;

  try {
    const query = `
      SELECT reviews.id, reviews.review_text, reviews.rating, reviews.created_at
      FROM reviews
      WHERE reviews.film_id = $1 AND reviews.user_id = $2
    `;
    const result = await pool.query(query, [film_id, user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

// Controller to add a review for a movie
export const addReview = async (req, res) => {
  const { film_id } = req.params;
  const { user_id, rating, review_text } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO reviews (film_id, user_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *",
      [film_id, user_id, rating, review_text]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add review" });
  }
};

export const deleteReview = async (req, res) => {
  const { review_id } = req.params;
  const { user_id } = req.query;

  try {
    const checkOwnershipQuery = `
      SELECT 1 FROM reviews WHERE id = $1 AND user_id = $2
    `;
    const ownershipResult = await pool.query(checkOwnershipQuery, [
      review_id,
      user_id,
    ]);

    if (ownershipResult.rowCount === 0) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this review" });
    }

    await pool.query("DELETE FROM reviews WHERE id = $1", [review_id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
};
