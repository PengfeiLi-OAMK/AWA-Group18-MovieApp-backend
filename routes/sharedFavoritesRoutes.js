import express from 'express';
import { getSharedFavorites, generateSharedId } from '../controllers/sharedFavoritesController.js';
import { auth } from '../helper/auth.js';
const router = express.Router();

router.get('/:id', getSharedFavorites);
router.post('/', auth, generateSharedId);

export default router;
