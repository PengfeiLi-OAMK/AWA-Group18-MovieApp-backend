// watchlistController.js
import watchlistService from '../services/watchlistService.js';

export const addWatchlistItem = async (req, res) => {
    const { movieId } = req.body; 
    const userId = req.user.id;

    try {
        const newItem = await watchlistService.addWatchlistItem(userId, movieId);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getWatchlist = async (req, res) => {
    const userId = req.user.id;
    const { limit } = req.query;

    try {
        const watchlist = await watchlistService.getWatchlistByUserId(userId, limit ? parseInt(limit) : null);
        res.status(200).json(watchlist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteWatchlistItem = async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;

    try {
        const deletedItem = await watchlistService.deleteWatchlistItem(userId, movieId);
        if (deletedItem) {
            res.status(200).json(deletedItem);
        } else {
            res.status(404).json({ error: 'Watchlist item not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
