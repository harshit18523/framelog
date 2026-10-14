import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  searchUsers,
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/user.controller';

const router = Router();

// Protect all user routes with JWT authentication
router.use(authenticate);

// Search users by query
router.get('/search', searchUsers);

// Get followers and following
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// Follow / Unfollow actions
router.post('/:id/follow', followUser);
router.delete('/:id/unfollow', unfollowUser);

// Get single user profile (can be ID or username)
router.get('/:id', getUserProfile);

export default router;
