import sharedFavoritesService from'../services/sharedFavoritesService.js';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Controller for fetching shared favorites
export const getSharedFavorites = async (req, res) => {
	const { id } = req.params;
  
	try {
	  const movieIds = await sharedFavoritesService.fetchSharedFavorites(id);
	  if (!movieIds || movieIds.length === 0) {
		return res.status(404).json({ error: 'Shared favorites not found' });
	  }
  
	  const movieDetails = await Promise.all(
		movieIds.map(async (movieId) => {
		  const response = await axios.get(
			`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
		  );
		  return response.data;
		})
	  );
  
	  res.status(200).json(movieDetails);
	} catch (error) {
	  console.error('Error fetching shared favorites:', error);
	  res.status(500).json({ error: 'Failed to fetch shared favorites' });
	}
  };
  
  // Controller for creating or retrieving shared_id
  export const generateSharedId = async (req, res) => {
	const userId = req.user.id; // Assuming authentication middleware provides the user ID
  
	try {
	  const sharedId = await sharedFavoritesService.createOrGetSharedId(userId);
	  res.status(201).json({ sharedId });
	} catch (error) {
	  console.error('Error generating shared ID:', error);
	  res.status(500).json({ error: 'Failed to generate shared ID' });
	}
  };
