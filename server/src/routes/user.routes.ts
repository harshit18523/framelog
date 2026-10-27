import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  searchUsers,
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  updateYearlyGoal,
  updateUserProfile,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../controllers/user.controller.js';

const router = Router();

// Protect all user routes with JWT authentication
router.use(authenticate);

// Update yearly movie goal for authenticated user
router.patch('/goal', updateYearlyGoal);

// Update user profile details
router.put('/profile', updateUserProfile);

// Mobile OTP verification routes
router.post('/phone-otp/send', sendPhoneOtp);
router.post('/phone-otp/verify', verifyPhoneOtp);

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
