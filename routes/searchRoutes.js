import express from 'express';
import  searchController  from'../controllers/searchController.js';

const router = express.Router();

// Define the search route
// Example: GET /api/search?query=inception&page=1
router.get('/', searchController);

export default router;
