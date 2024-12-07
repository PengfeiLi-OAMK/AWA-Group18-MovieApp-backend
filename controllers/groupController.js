import groupModel from '../models/groupModel.js';

export const createGroup = async (req, res) => {
    const { name, description } = req.body;
    const ownerId = req.user.id;

    try {
        const group = await groupModel.createGroup(ownerId, name, description);
        res.status(201).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating group', error });
    }
};

export const getAllGroups = async (req, res) => {
    try {
        const groups = await groupModel.getAllGroups();
        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching groups', error });
    }
};

export const getGroupDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const group = await groupModel.getGroupById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching group details', error });
    }
};

export const deleteGroup = async (req, res) => {
    const { id } = req.params;

    try {
        const group = await groupModel.getGroupById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.owner_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this group' });
        }

        await groupModel.deleteGroupById(id);
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting group', error });
    }
};
