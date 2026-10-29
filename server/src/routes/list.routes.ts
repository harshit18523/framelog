import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createList,
  getMyLists,
  getListById,
  updateList,
  deleteList,
  addFilmToList,
  removeFilmFromList,
  getListMembers,
  addMember,
  removeMember,
  searchUsersToInvite,
} from '../controllers/list.controller.js';

const router = Router();

// Protect all routes with auth middleware
router.use(authenticate);

// List collection endpoints
router.post('/', createList);
router.get('/', getMyLists);

// Single list endpoints
router.get('/:id', getListById);
router.put('/:id', updateList);
router.delete('/:id', deleteList);

// Film items within list
router.post('/:id/films', addFilmToList);
router.delete('/:id/films/:filmId', removeFilmFromList);

// Member management (collaborative lists)
router.get('/:id/members/search', searchUsersToInvite);  // must be before /:memberId
router.get('/:id/members', getListMembers);
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

export default router;
