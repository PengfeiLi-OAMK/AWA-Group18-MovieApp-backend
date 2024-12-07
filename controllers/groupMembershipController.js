import groupModel from '../models/groupModel.js';

export const addGroupMember = async (req, res) => {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    try {
        // Check if group exists
        const group = await groupModel.getGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is the owner (owners are already members)
        if (group.owner_id === userId) {
            return res.status(400).json({ message: 'You are the owner of this group' });
        }

        // Add member
        const member = await groupModel.addMember(groupId, userId);
        if (!member) {
            return res.status(400).json({ message: 'Failed to add member to group' });
        }

        res.status(201).json(member);
    } catch (error) {
        console.error('Error adding group member:', error);
        if (error.message === 'User is already a member of this group') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error while adding member' });
    }
};

export const removeGroupMember = async (req, res) => {
    const { id: groupId } = req.params;
    const { userId } = req.body;

    try {
        const group = await groupModel.getGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        
        // Only group owner can remove members, or users can remove themselves
        if (group.owner_id !== req.user.id && userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to remove members from this group' });
        }

        // Prevent owner from leaving their own group
        if (userId === group.owner_id) {
            return res.status(400).json({ message: 'Group owner cannot leave the group' });
        }

        const removed = await groupModel.removeMember(groupId, userId);
        if (!removed) {
            return res.status(404).json({ message: 'Member not found in group' });
        }

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Error removing group member:', error);
        res.status(500).json({ message: 'Error removing group member', error: error.message });
    }
};

export const getGroupMembers = async (req, res) => {
    const { id: groupId } = req.params;

    try {
        // Check if group exists
        const group = await groupModel.getGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const members = await groupModel.getGroupMembers(groupId);
        res.json(members);
    } catch (error) {
        console.error('Error getting group members:', error);
        res.status(500).json({ message: 'Error getting group members', error: error.message });
    }
};

export const checkMembership = async (req, res) => {
    const { id: groupId } = req.params;
    const userId = req.user.id;

    try {
        // Check if group exists
        const group = await groupModel.getGroupById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isMember = await groupModel.isMember(groupId, userId);
        res.json({ isMember });
    } catch (error) {
        console.error('Error checking membership:', error);
        res.status(500).json({ message: 'Error checking membership', error: error.message });
    }
};
