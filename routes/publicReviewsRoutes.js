import express from "express";
import { getAllPublicReviews } from "../controllers/publicReviewsController.js";

const router = express.Router();

// Route to get all public reviews
router.get("/", getAllPublicReviews);

export default router;
