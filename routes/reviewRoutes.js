import express from "express";
import {
  getReviews,
  addReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/:film_id", getReviews);
router.post("/:film_id", addReview);
router.delete("/:review_id", deleteReview);

export default router;
