import express from 'express';
import { auth } from '../helper/auth.js'; 
import { groupOwnerMiddleware } from '../helper/groupOwnerMiddleware.js';
import { 
    createGroup, 
    getAllGroups, 
    getGroupDetails, 
    deleteGroup 
} from '../controllers/groupController.js';
import {
    addGroupMember,
    removeGroupMember,
    getGroupMembers,
    checkMembership
} from '../controllers/groupMembershipController.js';
import {
    sendJoinRequest,
    cancelJoinRequest,
    getPendingRequests,
    acceptJoinRequest,
    deleteJoinRequest,
    checkRequestStatus
} from '../controllers/groupRequestController.js';
import {
    getUserGroups,
    addMovieToGroup,
    getGroupMovies,
    getMovieSharedGroups,
    deleteGroupMovie
} from '../controllers/groupMoviesController.js';

const router = express.Router();

// Group CRUD operations
router.post('/', auth, createGroup);
router.get('/', auth, getAllGroups);
router.get('/my-groups', auth, getUserGroups);
router.get('/:id', auth, getGroupDetails);
router.delete('/:id', auth, groupOwnerMiddleware, deleteGroup);

// Group membership operations
router.post('/:id/members', auth, addGroupMember);
router.delete('/:id/members', auth, removeGroupMember);
router.get('/:id/members', auth, getGroupMembers);
router.get('/:id/membership', auth, checkMembership);

// Group join request operations
router.post('/:groupId/requests', auth, sendJoinRequest);
router.delete('/:groupId/requests', auth, cancelJoinRequest);
router.get('/:groupId/requests', auth, groupOwnerMiddleware, getPendingRequests);
router.post('/:groupId/requests/:requestId/accept', auth, groupOwnerMiddleware, acceptJoinRequest);
router.delete('/:groupId/requests/:requestId', auth, groupOwnerMiddleware, deleteJoinRequest);
router.get('/:groupId/requests/status', auth, checkRequestStatus);

// Group movies operations
router.post('/:groupId/movies', auth, addMovieToGroup);
router.get('/:groupId/movies', auth, getGroupMovies);
router.get('/movies/:movieId/shared', auth, getMovieSharedGroups);
router.delete('/:groupId/movies/:movieId', auth, deleteGroupMovie);

export default router;
