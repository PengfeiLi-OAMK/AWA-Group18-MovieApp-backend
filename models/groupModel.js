import pool from '../database/db.js';

const createGroup = async (ownerId, name, description) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create the group
        const groupQuery = `
            INSERT INTO groups (owner_id, name, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const groupResult = await client.query(groupQuery, [ownerId, name, description]);
        const group = groupResult.rows[0];

        // Add owner as a member
        const memberQuery = `
            INSERT INTO group_members (group_id, user_id, is_owner)
            VALUES ($1, $2, true)
            RETURNING *;
        `;
        await client.query(memberQuery, [group.id, ownerId]);

        await client.query('COMMIT');
        return group;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getAllGroups = async () => {
    const query = `
        SELECT g.*, 
               COUNT(DISTINCT gm.user_id) as member_count
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id
        GROUP BY g.id;
    `;
    const result = await pool.query(query);
    return result.rows;
};

const getGroupById = async (groupId) => {
    const query = `
        SELECT g.*, 
               COUNT(DISTINCT gm.user_id) as member_count
        FROM groups g
        LEFT JOIN group_members gm ON g.id = gm.group_id
        WHERE g.id = $1
        GROUP BY g.id;
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows[0];
};

const deleteGroupById = async (groupId) => {
    const query = `
        DELETE FROM groups
        WHERE id = $1
        RETURNING *;
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows[0];
};

const addMember = async (groupId, userId) => {
    try {
        const query = `
            INSERT INTO group_members (group_id, user_id, is_owner)
            VALUES ($1, $2, false)
            RETURNING *;
        `;
        const result = await pool.query(query, [groupId, userId]);
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') { // Unique violation error code
            throw new Error('User is already a member of this group');
        }
        throw error;
    }
};

const removeMember = async (groupId, userId) => {
    const query = `
        DELETE FROM group_members
        WHERE group_id = $1 AND user_id = $2
        RETURNING *;
    `;
    const result = await pool.query(query, [groupId, userId]);
    return result.rows[0];
};

const getGroupMembers = async (groupId) => {
    const query = `
        SELECT u.id, u.username, u.email, gm.joined_at, gm.is_owner
        FROM group_members gm
        JOIN users u ON gm.user_id = u.id
        WHERE gm.group_id = $1
        ORDER BY gm.is_owner DESC, gm.joined_at DESC;
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows;
};

const isMember = async (groupId, userId) => {
    const query = `
        SELECT EXISTS (
            SELECT 1 FROM group_members
            WHERE group_id = $1 AND user_id = $2
        ) as is_member;
    `;
    const result = await pool.query(query, [groupId, userId]);
    return result.rows[0].is_member;
};

export default {
    createGroup,
    getAllGroups,
    getGroupById,
    deleteGroupById,
    addMember,
    removeMember,
    getGroupMembers,
    isMember,
};
