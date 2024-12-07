// watchlistRoutes.js
import express from 'express';
import { addWatchlistItem, getWatchlist, deleteWatchlistItem } from '../controllers/watchlistController.js';
import { auth } from '../helper/auth.js';

const router = express.Router();

router.post('/', auth, addWatchlistItem);

router.get('/', auth, getWatchlist);

router.delete('/:movieId', auth, deleteWatchlistItem);

export default router;
