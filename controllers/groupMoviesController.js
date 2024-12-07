import pool from '../database/db.js';

// Get all groups where user is a member
export const getUserGroups = async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `
            SELECT g.* 
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = $1;
        `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error in getUserGroups:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add movie to group
export const addMovieToGroup = async (req, res) => {
    const { groupId } = req.params;
    const { movieId } = req.body;
    const userId = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // First check if user is a member of the group
        const memberCheck = await client.query(
            'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (memberCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'You must be a member of the group to add movies' });
        }

        // Check if movie already exists in group
        const movieCheck = await client.query(
            'SELECT 1 FROM groupMovies WHERE group_id = $1 AND movie_id = $2',
            [groupId, movieId]
        );

        if (movieCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Movie already exists in this group' });
        }

        // Add movie to group
        const result = await client.query(
            'INSERT INTO groupMovies (group_id, movie_id) VALUES ($1, $2) RETURNING *',
            [groupId, movieId]
        );

        // Get all movies in the group
        const groupMovies = await client.query(
            `SELECT gm.*, g.name as group_name 
             FROM groupMovies gm
             JOIN groups g ON gm.group_id = g.id
             WHERE gm.group_id = $1`,
            [groupId]
        );

        await client.query('COMMIT');
        res.status(201).json(groupMovies.rows);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error in addMovieToGroup:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

// Get all movies in a group
export const getGroupMovies = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        // First check if user is a member of the group
        const memberCheck = await pool.query(
            'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({ message: 'You must be a member of the group to view movies' });
        }

        // Get all movies with their titles and user information
        const result = await pool.query(
            `SELECT gm.*, g.name as group_name 
             FROM groupMovies gm
             JOIN groups g ON gm.group_id = g.id
             WHERE gm.group_id = $1`,
            [groupId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error in getGroupMovies:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get groups where a movie has been shared
export const getMovieSharedGroups = async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.id;

    try {
        // Get all groups where the movie has been shared and the user is a member
        const result = await pool.query(
            `SELECT DISTINCT gm.group_id
             FROM groupMovies gm
             JOIN group_members mem ON gm.group_id = mem.group_id
             WHERE gm.movie_id = $1 AND mem.user_id = $2`,
            [movieId, userId]
        );

        res.json(result.rows.map(row => row.group_id));
    } catch (error) {
        console.error('Error in getMovieSharedGroups:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a movie from a group (owner only)
export const deleteGroupMovie = async (req, res) => {
    const { groupId, movieId } = req.params;
    const userId = req.user.id;

    try {
        // Check if user is the group owner
        const ownerCheck = await pool.query(
            'SELECT 1 FROM groups WHERE id = $1 AND owner_id = $2',
            [groupId, userId]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Only group owner can delete movies' });
        }

        // Delete the movie
        const result = await pool.query(
            'DELETE FROM groupMovies WHERE group_id = $1 AND movie_id = $2 RETURNING *',
            [groupId, movieId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Movie not found in group' });
        }

        res.json({ message: 'Movie removed from group successfully' });
    } catch (error) {
        console.error('Error in deleteGroupMovie:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
