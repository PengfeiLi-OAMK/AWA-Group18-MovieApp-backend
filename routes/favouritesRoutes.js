import express from 'express';
import { addFavourite, getFavourites, deleteFavourite } from '../controllers/favouritesController.js';
import { auth } from '../helper/auth.js';
const router = express.Router();

router.post('/',auth,addFavourite);

router.get('/', auth, getFavourites);

router.delete('/:movieId', auth,deleteFavourite);

export default router;
