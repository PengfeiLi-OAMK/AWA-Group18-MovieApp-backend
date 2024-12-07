import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Create an instance of Axios with the base URL and API key
const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

/**
 * Function to search for movies using TMDB API
 * @param {string} query - The search query
 * @param {number} page - The page number for pagination
 * @returns {Promise} - Returns a promise with the search results
 */
async function searchMovies(query, page = 1, filters = {}) {
  try {
    const params = { query, page };

    // Add filters directly to the API call
    if (filters.primary_release_year) params.primary_release_year = filters.primary_release_year;
    if (filters.language) params.language = filters.language;
    if (filters.region) params.region = filters.region;

    const response = await tmdbClient.get('/search/movie', { params });
    return { results: response.data.results, total_pages: response.data.total_pages };
  } catch (error) {
    console.error("Error fetching data from TMDB:", error.message);
    throw error;
  }
}

export {searchMovies};