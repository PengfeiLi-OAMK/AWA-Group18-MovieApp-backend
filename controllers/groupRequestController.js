import pool from '../database/db.js';

// Send a request to join a group
export const sendJoinRequest = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        // Check if user is already a member
        const memberCheck = await pool.query(
            'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (memberCheck.rows.length > 0) {
            return res.status(400).json({ message: 'You are already a member of this group' });
        }

        // Check if request already exists
        const requestCheck = await pool.query(
            'SELECT * FROM groupRequests WHERE group_id = $1 AND user_id = $2',
            [groupId, userId]
        );

        if (requestCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Join request already exists' });
        }

        // Create new request
        const result = await pool.query(
            'INSERT INTO groupRequests (group_id, user_id) VALUES ($1, $2) RETURNING *',
            [groupId, userId]
        );

        res.status(201).json({
            message: 'Join request sent successfully',
            request: result.rows[0]
        });
    } catch (error) {
        console.error('Error in sendJoinRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel join request
export const cancelJoinRequest = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        const result = await pool.query(
            'DELETE FROM groupRequests WHERE group_id = $1 AND user_id = $2 RETURNING *',
            [groupId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Join request not found' });
        }

        res.json({ message: 'Join request cancelled successfully' });
    } catch (error) {
        console.error('Error in cancelJoinRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all pending requests for a group (owner only)
export const getPendingRequests = async (req, res) => {
    const { groupId } = req.params;

    try {
        const requests = await pool.query(
            `SELECT gr.*, u.username, u.email 
             FROM groupRequests gr 
             JOIN users u ON gr.user_id = u.id 
             WHERE gr.group_id = $1 AND gr.approved = false`,
            [groupId]
        );

        res.json(requests.rows);
    } catch (error) {
        console.error('Error in getPendingRequests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Accept join request (owner only)
export const acceptJoinRequest = async (req, res) => {
    const { groupId, requestId } = req.params;

    try {
        // Start transaction
        await pool.query('BEGIN');

        // Get the request details
        const request = await pool.query(
            'SELECT * FROM groupRequests WHERE id = $1 AND group_id = $2',
            [requestId, groupId]
        );

        if (request.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Request not found' });
        }

        const userId = request.rows[0].user_id;

        // Add user to group_members
        await pool.query(
            'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
            [groupId, userId]
        );

        // Delete the request
        await pool.query(
            'DELETE FROM groupRequests WHERE id = $1',
            [requestId]
        );

        // Commit transaction
        await pool.query('COMMIT');

        res.json({ message: 'Join request accepted successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error in acceptJoinRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete join request (owner only)
export const deleteJoinRequest = async (req, res) => {
    const { groupId, requestId } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM groupRequests WHERE id = $1 AND group_id = $2 RETURNING *',
            [requestId, groupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json({ message: 'Join request deleted successfully' });
    } catch (error) {
        console.error('Error in deleteJoinRequest:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if user has a pending request
export const checkRequestStatus = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id;

    try {
        const request = await pool.query(
            'SELECT * FROM groupRequests WHERE group_id = $1 AND user_id = $2 AND approved = false',
            [groupId, userId]
        );

        res.json({
            hasPendingRequest: request.rows.length > 0
        });
    } catch (error) {
        console.error('Error in checkRequestStatus:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
