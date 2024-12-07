import pool from "../database/db.js";
import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = "https://api.themoviedb.org/3/movie/";

export const getAllPublicReviews = async (req, res) => {
  const { rating, title } = req.query;

  try {
    // 参数校验
    if (rating && isNaN(parseInt(rating))) {
      return res.status(400).json({ error: "Invalid rating parameter" });
    }
    if (title && typeof title !== "string") {
      return res.status(400).json({ error: "Invalid title parameter" });
    }

    // 动态构建 SQL 查询
    let query = `
      SELECT reviews.film_id, reviews.review_text, reviews.rating, reviews.created_at, 
             users.email AS user_email
      FROM reviews
      JOIN users ON reviews.user_id = users.id
    `;
    let queryParams = [];
    let conditions = [];

    if (rating) {
      conditions.push(`reviews.rating = $${queryParams.length + 1}`);
      queryParams.push(parseInt(rating));
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    query += ` ORDER BY reviews.created_at DESC`;

    const result = await pool.query(query, queryParams);

    // 获取电影数据
    const reviewsWithFilmData = await Promise.all(
      result.rows.map(async (review) => {
        try {
          const response = await axios.get(`${TMDB_API_URL}${review.film_id}`, {
            params: { api_key: TMDB_API_KEY },
          });

          const film = response.data;
          const filmTitle = film.title || "Unknown Film";

          if (title && !filmTitle.toLowerCase().includes(title.toLowerCase())) {
            return null;
          }

          return {
            film_id: review.film_id,
            film_title: filmTitle,
            poster_url: film.poster_path
              ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
              : null,
            rating: review.rating,
            review_text: review.review_text,
            user_email: review.user_email,
            created_at: review.created_at,
          };
        } catch (error) {
          console.error(
            `Error fetching movie data for film_id ${review.film_id}`
          );
          return null;
        }
      })
    );

    const filteredReviews = reviewsWithFilmData.filter(
      (review) => review !== null
    );

    res.json(filteredReviews);
  } catch (err) {
    console.error(`Database error: ${err.code} - ${err.message}`);
    res.status(500).json({ error: "Failed to fetch public reviews" });
  }
};
