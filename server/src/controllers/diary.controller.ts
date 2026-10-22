import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import DiaryEntry from '../models/DiaryEntry.js';
import WatchlistItem from '../models/WatchlistItem.js';
import FilmLike from '../models/FilmLike.js';
import tmdbService from '../services/tmdb.service.js';

/**
 * @desc    Get all diary entries for authenticated user
 * @route   GET /api/diary
 * @access  Private
 */
export const getDiaryEntries = asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetUserId = (req.query.userId as string) || req.user!._id;

  const entries = await DiaryEntry.find({ userId: targetUserId }).sort({ date: -1, createdAt: -1 });

  res.status(200).json(new ApiResponse(entries, 'Diary entries retrieved successfully'));
});

/**
 * @desc    Create a new diary entry
 * @route   POST /api/diary
 * @access  Private
 */
export const createDiaryEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { filmId, date, rating, review, liked, rewatch, film: providedFilm } = req.body;

  if (!filmId) {
    throw new ApiError(400, 'Film ID is required');
  }

  if (!date) {
    throw new ApiError(400, 'Date is required');
  }

  // Attempt to attach film details if available
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
          runtime: details.runtime,
          poster: details.poster,
          backdrop: details.backdrop,
          genres: details.genres,
        };
      }
    } catch {
      // Non-blocking if film lookup fails
    }
  }

  const newEntry = await DiaryEntry.create({
    userId,
    filmId: String(filmId),
    date,
    rating: rating !== undefined ? Number(rating) : undefined,
    review: review ? String(review).trim() : undefined,
    liked: Boolean(liked),
    rewatch: Boolean(rewatch),
    film: filmDetails,
  });

  // Sync likes if marked as liked
  if (liked) {
    await FilmLike.updateOne(
      { userId, filmId: String(filmId) },
      { userId, filmId: String(filmId) },
      { upsert: true }
    );
  }

  // Automatically remove from watchlist when logged/watched
  await WatchlistItem.deleteOne({ userId, filmId: String(filmId) });

  res.status(201).json(new ApiResponse(newEntry, 'Diary entry logged successfully'));
});

/**
 * @desc    Update a diary entry
 * @route   PUT /api/diary/:id
 * @access  Private
 */
export const updateDiaryEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;
  const { date, rating, review, liked, rewatch } = req.body;

  const entry = await DiaryEntry.findOne({ _id: id, userId });
  if (!entry) {
    throw new ApiError(404, 'Diary entry not found');
  }

  if (date !== undefined) entry.date = date;
  if (rating !== undefined) entry.rating = rating;
  if (review !== undefined) entry.review = review ? String(review).trim() : undefined;
  if (liked !== undefined) {
    entry.liked = Boolean(liked);
    if (liked) {
      await FilmLike.updateOne(
        { userId, filmId: entry.filmId },
        { userId, filmId: entry.filmId },
        { upsert: true }
      );
    } else {
      await FilmLike.deleteOne({ userId, filmId: entry.filmId });
    }
  }
  if (rewatch !== undefined) entry.rewatch = Boolean(rewatch);

  await entry.save();

  res.status(200).json(new ApiResponse(entry, 'Diary entry updated successfully'));
});

/**
 * @desc    Delete a diary entry
 * @route   DELETE /api/diary/:id
 * @access  Private
 */
export const deleteDiaryEntry = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { id } = req.params;

  const entry = await DiaryEntry.findOneAndDelete({ _id: id, userId });
  if (!entry) {
    throw new ApiError(404, 'Diary entry not found');
  }

  res.status(200).json(new ApiResponse(null, 'Diary entry deleted successfully'));
});
