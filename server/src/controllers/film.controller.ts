import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import tmdbService from '../services/tmdb.service.js';

/**
 * @desc    Search movies by query and optional genre
 * @route   GET /api/films/search?query=&genre=&page=
 * @access  Public
 */
export const searchFilms = asyncHandler(async (req: Request, res: Response) => {
  const query = ((req.query.query as string) || (req.query.q as string) || '').trim();
  const genre = req.query.genre as string | undefined;
  const page = parseInt(req.query.page as string, 10) || 1;

  if (!query && !genre) {
    return res.status(200).json(
      new ApiResponse({ results: [], totalResults: 0, page: 1 }, 'No search query provided')
    );
  }

  // If search query is empty but genre is provided, fetch top films in that genre from TMDB discover
  if (!query && genre) {
    const discoverResult = await tmdbService.getDiscoverMovies({ genre, page });
    return res.status(200).json(
      new ApiResponse(
        {
          results: discoverResult.results,
          totalResults: discoverResult.results.length,
          page: discoverResult.page,
        },
        'Films by genre retrieved successfully'
      )
    );
  }

  const result = await tmdbService.searchMovies(query, page, genre);
  res.status(200).json(new ApiResponse(result, 'Films search results retrieved successfully'));
});

/**
 * @desc    Get popular movies
 * @route   GET /api/films/popular?page=
 * @access  Public
 */
export const getPopularFilms = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const result = await tmdbService.getPopularMovies(page);
  res.status(200).json(new ApiResponse(result, 'Popular films retrieved successfully'));
});

/**
 * @desc    Get trending movies
 * @route   GET /api/films/trending?timeWindow=
 * @access  Public
 */
export const getTrendingFilms = asyncHandler(async (req: Request, res: Response) => {
  const timeWindow = req.query.timeWindow === 'day' ? 'day' : 'week';
  const result = await tmdbService.getTrendingMovies(timeWindow);
  res.status(200).json(new ApiResponse(result, 'Trending films retrieved successfully'));
});

/**
 * @desc    Discover movies by genre and sort order
 * @route   GET /api/films/discover?genre=&sortBy=&page=
 * @access  Public
 */
export const getDiscoverFilms = asyncHandler(async (req: Request, res: Response) => {
  const genre = req.query.genre as string | undefined;
  const sortBy = req.query.sortBy as string | undefined;
  const page = parseInt(req.query.page as string, 10) || 1;

  const result = await tmdbService.getDiscoverMovies({ genre, sortBy, page });
  res.status(200).json(new ApiResponse(result, 'Discover films retrieved successfully'));
});

/**
 * @desc    Get movie details by ID
 * @route   GET /api/films/:id
 * @access  Public
 */
export const getFilmById = asyncHandler(async (req: Request, res: Response) => {
  const rawId = req.params.id;

  if (!rawId) {
    throw new ApiError(400, 'Film ID is required');
  }

  const filmId = Array.isArray(rawId) ? rawId[0] : String(rawId);
  const film = await tmdbService.getMovieDetails(filmId);
  res.status(200).json(new ApiResponse(film, 'Film details retrieved successfully'));
});
