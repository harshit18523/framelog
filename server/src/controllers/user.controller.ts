import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User';
import { Follow } from '../models/Follow';
import { DiaryEntry } from '../models/DiaryEntry';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import asyncHandler from '../utils/asyncHandler';

/**
 * Search users by name or username
 * GET /api/users/search?q=
 */
export const searchUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const q = ((req.query.q as string) || '').trim();

  if (!q) {
    return res.status(200).json(new ApiResponse([], 'No query provided'));
  }

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');

  const users = await User.find({
    $or: [{ username: regex }, { name: regex }],
  })
    .select('_id name username avatar bio location createdAt')
    .limit(15)
    .lean();

  // Check which of these users the current user is following
  let followingSet = new Set<string>();
  if (currentUserId) {
    const userIds = users.map((u) => u._id);
    const follows = await Follow.find({
      followerId: currentUserId,
      followingId: { $in: userIds },
    }).lean();
    followingSet = new Set(follows.map((f) => f.followingId.toString()));
  }

  const formattedUsers = users.map((u) => {
    const isSelf = currentUserId ? u._id.toString() === currentUserId.toString() : false;
    return {
      id: u._id.toString(),
      _id: u._id.toString(),
      name: u.name,
      username: u.username,
      avatar: u.avatar || '',
      bio: u.bio || '',
      location: u.location || '',
      createdAt: u.createdAt,
      isFollowing: followingSet.has(u._id.toString()),
      isSelf,
    };
  });

  return res.status(200).json(new ApiResponse(formattedUsers, 'Users search results'));
});

/**
 * Get user profile by ID or username
 * GET /api/users/:id
 */
export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const identifier = String(req.params.id || '').trim();

  let userDoc;
  if (mongoose.isValidObjectId(identifier)) {
    userDoc = await User.findById(identifier).lean();
  }
  if (!userDoc) {
    userDoc = await User.findOne({ username: identifier.toLowerCase() }).lean();
  }

  if (!userDoc) {
    throw new ApiError(404, 'User not found');
  }

  const targetUserId = userDoc._id;
  const isSelf = currentUserId ? currentUserId.toString() === targetUserId.toString() : false;

  const [followersCount, followingCount, loggedFilmsCount, isFollowingRecord] = await Promise.all([
    Follow.countDocuments({ followingId: targetUserId }),
    Follow.countDocuments({ followerId: targetUserId }),
    DiaryEntry.countDocuments({ userId: targetUserId }),
    currentUserId
      ? Follow.findOne({ followerId: currentUserId, followingId: targetUserId }).lean()
      : null,
  ]);

  const profileData = {
    id: userDoc._id.toString(),
    _id: userDoc._id.toString(),
    name: userDoc.name,
    username: userDoc.username,
    avatar: userDoc.avatar || '',
    bio: userDoc.bio || '',
    location: userDoc.location || '',
    createdAt: userDoc.createdAt,
    followersCount,
    followingCount,
    loggedFilmsCount,
    isFollowing: Boolean(isFollowingRecord),
    isSelf,
  };

  return res.status(200).json(new ApiResponse(profileData, 'User profile fetched successfully'));
});

/**
 * Follow a user
 * POST /api/users/:id/follow
 */
export const followUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const targetId = req.params.id;

  if (!currentUserId) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (!mongoose.isValidObjectId(targetId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  if (currentUserId.toString() === targetId) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    throw new ApiError(404, 'User to follow does not exist');
  }

  await Follow.findOneAndUpdate(
    { followerId: currentUserId, followingId: targetId },
    { followerId: currentUserId, followingId: targetId },
    { upsert: true, new: true }
  );

  const followersCount = await Follow.countDocuments({ followingId: targetId });

  return res.status(200).json(
    new ApiResponse(
      { isFollowing: true, followersCount },
      `You are now following @${targetUser.username}`
    )
  );
});

/**
 * Unfollow a user
 * DELETE /api/users/:id/unfollow
 */
export const unfollowUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const targetId = req.params.id;

  if (!currentUserId) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (!mongoose.isValidObjectId(targetId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  await Follow.findOneAndDelete({
    followerId: currentUserId,
    followingId: targetId,
  });

  const followersCount = await Follow.countDocuments({ followingId: targetId });

  return res.status(200).json(
    new ApiResponse(
      { isFollowing: false, followersCount },
      'User unfollowed successfully'
    )
  );
});

/**
 * Get followers of a user
 * GET /api/users/:id/followers
 */
export const getFollowers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const targetId = req.params.id;

  if (!mongoose.isValidObjectId(targetId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const follows = await Follow.find({ followingId: targetId })
    .populate('followerId', '_id name username avatar bio location')
    .sort({ createdAt: -1 })
    .lean();

  const followerUsers = follows
    .filter((f) => f.followerId)
    .map((f) => {
      const u = f.followerId as any;
      return {
        id: u._id.toString(),
        _id: u._id.toString(),
        name: u.name,
        username: u.username,
        avatar: u.avatar || '',
        bio: u.bio || '',
        location: u.location || '',
      };
    });

  return res.status(200).json(new ApiResponse(followerUsers, 'Followers list fetched'));
});

/**
 * Get list of users that target user is following
 * GET /api/users/:id/following
 */
export const getFollowing = asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetId = req.params.id;

  if (!mongoose.isValidObjectId(targetId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const follows = await Follow.find({ followerId: targetId })
    .populate('followingId', '_id name username avatar bio location')
    .sort({ createdAt: -1 })
    .lean();

  const followingUsers = follows
    .filter((f) => f.followingId)
    .map((f) => {
      const u = f.followingId as any;
      return {
        id: u._id.toString(),
        _id: u._id.toString(),
        name: u.name,
        username: u.username,
        avatar: u.avatar || '',
        bio: u.bio || '',
        location: u.location || '',
      };
    });

  return res.status(200).json(new ApiResponse(followingUsers, 'Following list fetched'));
});
