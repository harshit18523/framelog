import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import WatchedFilm from '../models/WatchedFilm.js';
import WatchlistItem from '../models/WatchlistItem.js';
import tmdbService from '../services/tmdb.service.js';

/**
 * @desc    Get watched films for authenticated user or specified user
 * @route   GET /api/watched
 * @access  Private
 */
export const getWatchedFilms = asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetUserId = (req.query.userId as string) || req.user!._id;

  const items = await WatchedFilm.find({ userId: targetUserId }).sort({ createdAt: -1 });
  const filmIds = items.map((item) => item.filmId);

  res.status(200).json(
    new ApiResponse(
      { items, filmIds },
      'Watched films retrieved successfully'
    )
  );
});

/**
 * @desc    Mark a film as watched
 * @route   POST /api/watched
 * @access  Private
 */
export const addWatchedFilm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { filmId, film: providedFilm } = req.body;

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  let filmDetails = providedFilm;
  if (!filmDetails) {
    try {
      const details = await tmdbService.getMovieDetails(filmId);
      if (details) {
        filmDetails = {
          id: details.id,
          title: details.title,
          year: details.year,
          director: details.director,
          poster: details.poster,
          backdrop: details.backdrop,
          genres: details.genres,
        };
      }
    } catch {
      // Non-blocking
    }
  }

  const item = await WatchedFilm.findOneAndUpdate(
    { userId, filmId: String(filmId) },
    { userId, filmId: String(filmId), film: filmDetails },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Automatically remove from watchlist when watched
  await WatchlistItem.deleteOne({ userId, filmId: String(filmId) });

  res.status(201).json(new ApiResponse(item, 'Film marked as watched successfully'));
});

/**
 * @desc    Unmark a film as watched
 * @route   DELETE /api/watched/:filmId
 * @access  Private
 */
export const removeWatchedFilm = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { filmId } = req.params;

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  await WatchedFilm.findOneAndDelete({ userId, filmId: String(filmId) });

  res.status(200).json(new ApiResponse(null, 'Film removed from watched successfully'));
});
