import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import favouritesRoutes from "./routes/favouritesRoutes.js";
import sharedFavoritesRoutes from "./routes/sharedFavoritesRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import publicReviewsRoutes from "./routes/publicReviewsRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import pool from "./database/db.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favourites", favouritesRoutes);
app.use("/api/shared-favorites", sharedFavoritesRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/public-reviews", publicReviewsRoutes);
app.use("/api/watchlist", watchlistRoutes);

//  Database connection test
pool.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log(
      `Connected to the ${
        process.env.NODE_ENV === "test" ? "test" : "production"
      } database`
    );
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
