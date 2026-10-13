import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import FilmLike from '../models/FilmLike';

/**
 * @desc    Get liked film IDs for authenticated user
 * @route   GET /api/likes
 * @access  Private
 */
export const getLikes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  const likes = await FilmLike.find({ userId }).sort({ createdAt: -1 });
  const filmIds = likes.map((like) => like.filmId);

  res.status(200).json(
    new ApiResponse(
      { filmIds },
      'Liked films retrieved successfully'
    )
  );
});

/**
 * @desc    Like a film
 * @route   POST /api/likes
 * @access  Private
 */
export const likeFilm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { filmId } = req.body;

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  const like = await FilmLike.findOneAndUpdate(
    { userId, filmId: String(filmId) },
    { userId, filmId: String(filmId), createdAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(new ApiResponse(like, 'Film liked successfully'));
});

/**
 * @desc    Unlike a film
 * @route   DELETE /api/likes/:filmId
 * @access  Private
 */
export const unlikeFilm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { filmId } = req.params;

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  await FilmLike.findOneAndDelete({ userId, filmId: String(filmId) });

  res.status(200).json(new ApiResponse(null, 'Film unliked successfully'));
});
