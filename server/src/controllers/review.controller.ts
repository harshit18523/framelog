import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { DiaryEntry } from '../models/DiaryEntry.js';
import { Follow } from '../models/Follow.js';
import { ReviewComment } from '../models/ReviewComment.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Get reviews written by friends (people current user follows) for a specific film
 * GET /api/reviews/films/:filmId/friends
 */
export const getFriendsFilmReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const filmId = String(req.params.filmId || '').trim();

  if (!currentUserId) {
    throw new ApiError(401, 'Unauthorized');
  }

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  // Find users that the current user is following
  const follows = await Follow.find({ followerId: currentUserId }).select('followingId').lean();
  const followingIds = follows.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return res.status(200).json(new ApiResponse([], "No friends' reviews found"));
  }

  // Find reviews from followed users for this film
  const entries = await DiaryEntry.find({
    filmId,
    userId: { $in: followingIds },
    review: { $exists: true, $nin: ['', null] },
  })
    .populate('userId', '_id name username avatar bio location')
    .sort({ createdAt: -1 })
    .lean();

  if (entries.length === 0) {
    return res.status(200).json(new ApiResponse([], "No friends' reviews found"));
  }

  const reviewIds = entries.map((e) => e._id);

  // Aggregate comment counts for each review
  const commentCounts = await ReviewComment.aggregate([
    { $match: { reviewId: { $in: reviewIds } } },
    { $group: { _id: '$reviewId', count: { $sum: 1 } } },
  ]);

  const countsMap = new Map<string, number>();
  commentCounts.forEach((c) => {
    countsMap.set(c._id.toString(), c.count);
  });

  const formattedReviews = entries
    .filter((e) => e.userId)
    .map((e) => {
      const u = e.userId as any;
      const reviewIdStr = e._id.toString();
      return {
        id: reviewIdStr,
        _id: reviewIdStr,
        filmId: e.filmId,
        user: {
          id: u._id.toString(),
          _id: u._id.toString(),
          name: u.name || 'User',
          username: u.username || 'user',
          avatar: u.avatar || '',
          bio: u.bio || '',
        },
        rating: e.rating,
        review: e.review,
        liked: Boolean(e.liked),
        rewatch: Boolean(e.rewatch),
        date: e.date,
        commentsCount: countsMap.get(reviewIdStr) || 0,
        createdAt: e.createdAt,
      };
    });

  return res.status(200).json(new ApiResponse(formattedReviews, "Friends' reviews fetched successfully"));
});

/**
 * Get comments and replies for a review
 * GET /api/reviews/:reviewId/comments
 */
export const getReviewComments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const reviewId = req.params.reviewId;

  if (!currentUserId) throw new ApiError(401, 'Unauthorized');
  if (!mongoose.isValidObjectId(reviewId)) {
    throw new ApiError(400, 'Invalid review ID');
  }

  const review = await DiaryEntry.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Authorization: allow review author, followers of review author, or users followed by review author
  const isAuthor = review.userId.toString() === currentUserId.toString();
  if (!isAuthor) {
    const isFriend = await Follow.findOne({
      $or: [
        { followerId: currentUserId, followingId: review.userId },
        { followerId: review.userId, followingId: currentUserId },
      ],
    }).lean();

    if (!isFriend) {
      throw new ApiError(403, 'Comments are only visible to friends of the reviewer');
    }
  }

  const rawComments = await ReviewComment.find({ reviewId })
    .populate('userId', '_id name username avatar')
    .sort({ createdAt: 1 })
    .lean();

  const formatted = rawComments
    .filter((c) => c.userId)
    .map((c) => {
      const u = c.userId as any;
      const isMyComment = u._id.toString() === currentUserId.toString();
      return {
        id: c._id.toString(),
        _id: c._id.toString(),
        reviewId: c.reviewId.toString(),
        filmId: c.filmId,
        user: {
          id: u._id.toString(),
          _id: u._id.toString(),
          name: u.name || 'User',
          username: u.username || 'user',
          avatar: u.avatar || '',
        },
        content: c.content,
        parentId: c.parentId ? c.parentId.toString() : null,
        isMine: isMyComment,
        createdAt: c.createdAt,
      };
    });

  return res.status(200).json(new ApiResponse(formatted, 'Review comments fetched successfully'));
});

/**
 * Add a comment or reply to a review
 * POST /api/reviews/:reviewId/comments
 * Body: { content: string, parentId?: string }
 */
export const addReviewComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const reviewId = req.params.reviewId;
  const { content, parentId } = req.body;

  if (!currentUserId) throw new ApiError(401, 'Unauthorized');
  if (!mongoose.isValidObjectId(reviewId)) {
    throw new ApiError(400, 'Invalid review ID');
  }

  const trimmed = (content || '').trim();
  if (!trimmed) {
    throw new ApiError(400, 'Comment content cannot be empty');
  }

  const review = await DiaryEntry.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Authorization: must be review author or a friend (following/mutual)
  const isAuthor = review.userId.toString() === currentUserId.toString();
  if (!isAuthor) {
    const isFriend = await Follow.findOne({
      $or: [
        { followerId: currentUserId, followingId: review.userId },
        { followerId: review.userId, followingId: currentUserId },
      ],
    }).lean();

    if (!isFriend) {
      throw new ApiError(403, 'You must follow or be friends with the reviewer to comment');
    }
  }

  let validParentId: mongoose.Types.ObjectId | null = null;
  if (parentId && mongoose.isValidObjectId(parentId)) {
    const parentComment = await ReviewComment.findById(parentId);
    if (parentComment && parentComment.reviewId.toString() === reviewId) {
      validParentId = parentComment._id as mongoose.Types.ObjectId;
    }
  }

  const newComment = await ReviewComment.create({
    reviewId: review._id,
    filmId: review.filmId,
    userId: currentUserId,
    content: trimmed,
    parentId: validParentId,
  });

  const populated = await ReviewComment.findById(newComment._id)
    .populate('userId', '_id name username avatar')
    .lean();

  const u = (populated?.userId || req.user) as any;
  const formatted = {
    id: newComment._id.toString(),
    _id: newComment._id.toString(),
    reviewId: review._id.toString(),
    filmId: review.filmId,
    user: {
      id: u._id.toString(),
      _id: u._id.toString(),
      name: u.name || 'User',
      username: u.username || 'user',
      avatar: u.avatar || '',
    },
    content: trimmed,
    parentId: validParentId ? validParentId.toString() : null,
    isMine: true,
    createdAt: newComment.createdAt,
  };

  return res.status(201).json(new ApiResponse(formatted, 'Comment added successfully'));
});

/**
 * Delete a comment on a review
 * DELETE /api/reviews/comments/:commentId
 */
export const deleteReviewComment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user?._id;
  const commentId = req.params.commentId;

  if (!currentUserId) throw new ApiError(401, 'Unauthorized');
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, 'Invalid comment ID');
  }

  const comment = await ReviewComment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, 'Comment not found');
  }

  const review = await DiaryEntry.findById(comment.reviewId);
  const isCommentAuthor = comment.userId.toString() === currentUserId.toString();
  const isReviewAuthor = review ? review.userId.toString() === currentUserId.toString() : false;

  if (!isCommentAuthor && !isReviewAuthor) {
    throw new ApiError(403, 'You do not have permission to delete this comment');
  }

  // Delete this comment and any child replies
  await ReviewComment.deleteMany({
    $or: [{ _id: comment._id }, { parentId: comment._id }],
  });

  return res.status(200).json(new ApiResponse({ success: true }, 'Comment deleted successfully'));
});
