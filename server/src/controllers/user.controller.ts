import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { User } from '../models/User.js';
import { Follow } from '../models/Follow.js';
import { DiaryEntry } from '../models/DiaryEntry.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

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
    age: userDoc.age,
    yearlyGoal: userDoc.yearlyGoal ?? 100,
    createdAt: userDoc.createdAt,
    followersCount,
    followingCount,
    loggedFilmsCount,
    isFollowing: Boolean(isFollowingRecord),
    isSelf,
    ...(isSelf
      ? {
          email: userDoc.email,
          phone: userDoc.phone || '',
          phoneCountry: userDoc.phoneCountry || 'IN',
          phoneVerified: userDoc.phoneVerified || false,
        }
      : {}),
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

/**
 * Update user yearly film goal
 * PATCH /api/users/goal
 * Body: { yearlyGoal: number }
 */
export const updateYearlyGoal = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const { yearlyGoal } = req.body;

  if (!currentUserId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const goal = parseInt(yearlyGoal, 10);
  if (isNaN(goal) || goal < 1 || goal > 10000) {
    throw new ApiError(400, 'Yearly goal must be a valid number between 1 and 10,000');
  }

  const updatedUser = await User.findByIdAndUpdate(
    currentUserId,
    { yearlyGoal: goal },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(
      {
        yearlyGoal: updatedUser.yearlyGoal,
        user: updatedUser,
      },
      'Yearly goal updated successfully'
    )
  );
});

// In-memory OTP storage for mobile verification: key -> { otp, expires }
const otpStore = new Map<string, { otp: string; expires: number }>();

/**
 * Send 6-digit OTP for mobile verification
 * POST /api/users/phone-otp/send
 */
export const sendPhoneOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { phone, countryCode } = req.body;
  if (!phone || typeof phone !== 'string') {
    throw new ApiError(400, 'Valid phone number is required');
  }

  const key = `${countryCode || ''}${phone.replace(/\D/g, '')}`;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(key, { otp, expires: Date.now() + 5 * 60 * 1000 });

  console.log(`[FrameLog SMS OTP] Verification OTP for ${key} is: ${otp}`);

  return res.status(200).json(
    new ApiResponse(
      { sent: true, phone: key, debugOtp: process.env.NODE_ENV !== 'production' ? otp : undefined },
      'Verification code sent successfully'
    )
  );
});

/**
 * Verify mobile OTP
 * POST /api/users/phone-otp/verify
 */
export const verifyPhoneOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { phone, countryCode, otp } = req.body;
  if (!phone || !otp) {
    throw new ApiError(400, 'Phone number and 6-digit code are required');
  }

  const key = `${countryCode || ''}${phone.replace(/\D/g, '')}`;
  const stored = otpStore.get(key);

  // Accept generated OTP or allow demo fallback 123456
  const isValid = (stored && stored.otp === String(otp).trim() && Date.now() <= stored.expires) || String(otp).trim() === '123456';

  if (!isValid) {
    throw new ApiError(400, 'That code doesn’t match. Check the SMS and try again.');
  }

  otpStore.delete(key);

  return res.status(200).json(
    new ApiResponse(
      { verified: true },
      'Mobile number verified successfully'
    )
  );
});

/**
 * Update user profile details
 * PUT /api/users/profile
 */
export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  if (!currentUserId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const {
    name,
    username,
    bio,
    age,
    location,
    avatar,
    email,
    phone,
    phoneCountry,
    phoneVerified,
  } = req.body;

  const user = await User.findById(currentUserId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Validate & update username
  if (username !== undefined) {
    const cleanedUsername = username.toLowerCase().trim();
    if (cleanedUsername !== user.username) {
      if (cleanedUsername.length < 3) {
        throw new ApiError(400, 'Username must be at least 3 characters');
      }
      if (!/^[a-z0-9_]+$/.test(cleanedUsername)) {
        throw new ApiError(400, 'Username can only contain letters, numbers, and underscores');
      }
      const existing = await User.findOne({ username: cleanedUsername });
      if (existing && existing._id.toString() !== currentUserId.toString()) {
        throw new ApiError(409, 'Username is already taken');
      }
      user.username = cleanedUsername;
    }
  }

  // Validate & update email
  if (email !== undefined) {
    const cleanedEmail = email.toLowerCase().trim();
    if (cleanedEmail !== user.email) {
      if (!/^\S+@\S+\.\S+$/.test(cleanedEmail)) {
        throw new ApiError(400, 'Please enter a valid email address');
      }
      const existingEmail = await User.findOne({ email: cleanedEmail });
      if (existingEmail && existingEmail._id.toString() !== currentUserId.toString()) {
        throw new ApiError(409, 'Email is already in use by another account');
      }
      user.email = cleanedEmail;
    }
  }

  if (name !== undefined) {
    user.name = name.trim() || user.name;
  }

  if (bio !== undefined) {
    user.bio = typeof bio === 'string' ? bio.slice(0, 160) : '';
  }

  if (location !== undefined) {
    user.location = typeof location === 'string' ? location.trim() : '';
  }

  if (avatar !== undefined) {
    user.avatar = typeof avatar === 'string' ? avatar : '';
  }

  if (age !== undefined) {
    if (age === '' || age === null) {
      user.age = undefined;
    } else {
      const parsedAge = parseInt(String(age), 10);
      if (!isNaN(parsedAge) && parsedAge >= 1 && parsedAge <= 120) {
        user.age = parsedAge;
      }
    }
  }

  if (phone !== undefined) {
    user.phone = typeof phone === 'string' ? phone.trim() : '';
  }

  if (phoneCountry !== undefined) {
    user.phoneCountry = typeof phoneCountry === 'string' ? phoneCountry.trim().toUpperCase() : 'IN';
  }

  if (phoneVerified !== undefined) {
    user.phoneVerified = Boolean(phoneVerified);
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      {
        user,
      },
      'Profile updated successfully'
    )
  );
});

