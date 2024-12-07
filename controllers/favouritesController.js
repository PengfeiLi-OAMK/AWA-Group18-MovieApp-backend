import favouritesService from '../services/favouritesService.js';

export const addFavourite = async (req, res) => {
    const { movieId } = req.body; 
    const userId = req.user.id;

    try {
        const newFavourite = await favouritesService.addFavourite(userId, movieId);
        res.status(201).json(newFavourite);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getFavourites = async (req, res) => {
    const userId = req.user.id;

    try {
        const favourites = await favouritesService.getFavouritesByUserId(userId);
        res.status(200).json(favourites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteFavourite = async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;

    try {
        const deletedFavourite = await favouritesService.deleteFavourite(userId, movieId);
        if (deletedFavourite) {
            res.status(200).json(deletedFavourite);
        } else {
            res.status(404).json({ error: 'Favourite not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
