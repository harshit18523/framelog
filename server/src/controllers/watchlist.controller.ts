import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';
import WatchlistItem from '../models/WatchlistItem';
import tmdbService from '../services/tmdb.service';

/**
 * @desc    Get watchlist for authenticated user
 * @route   GET /api/watchlist
 * @access  Private
 */
export const getWatchlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;

  const items = await WatchlistItem.find({ userId }).sort({ addedAt: -1 });
  const filmIds = items.map((item) => item.filmId);

  res.status(200).json(
    new ApiResponse(
      { items, filmIds },
      'Watchlist retrieved successfully'
    )
  );
});

/**
 * @desc    Add a film to watchlist
 * @route   POST /api/watchlist
 * @access  Private
 */
export const addToWatchlist = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  const item = await WatchlistItem.findOneAndUpdate(
    { userId, filmId: String(filmId) },
    { userId, filmId: String(filmId), film: filmDetails, addedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json(new ApiResponse(item, 'Film added to watchlist successfully'));
});

/**
 * @desc    Remove a film from watchlist
 * @route   DELETE /api/watchlist/:filmId
 * @access  Private
 */
export const removeFromWatchlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { filmId } = req.params;

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  await WatchlistItem.findOneAndDelete({ userId, filmId: String(filmId) });

  res.status(200).json(new ApiResponse(null, 'Film removed from watchlist successfully'));
});
