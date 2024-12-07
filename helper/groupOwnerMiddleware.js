import groupModel from '../models/groupModel.js';

export const groupOwnerMiddleware = async (req, res, next) => {
    const groupId = req.params.groupId || req.params.id; // Handle both parameter names

    try {
        const group = await groupModel.getGroupById(groupId);
        if (!group) {
            console.log('Group not found:', groupId);
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.owner_id !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying group ownership', error });
    }
};
