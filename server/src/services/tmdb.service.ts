import Film, { IFilm } from '../models/Film';
import { ApiError } from '../utils/ApiError';

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_POSTER = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMAGE_BASE_BACKDROP = 'https://image.tmdb.org/t/p/w1280';

// TMDB Genre ID to Name Mapping
export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

// Genre Name to TMDB ID Mapping
export const GENRE_NAME_TO_ID: Record<string, number> = Object.entries(TMDB_GENRES).reduce(
  (acc, [id, name]) => {
    acc[name.toLowerCase()] = Number(id);
    return acc;
  },
  {} as Record<string, number>
);

const formatCount = (count?: number): string => {
  if (!count) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

/**
 * Fetch helper for TMDB API requests with Bearer Token
 */
async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const token = (process.env.TMDB_BEARER_TOKEN || '').trim();

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.append(key, String(val));
    }
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new ApiError(
      response.status,
      `TMDB API Error (${response.status}): ${errorBody || response.statusText}`
    );
  }

  return (await response.json()) as T;
}

/**
 * Transform a TMDB list movie item into our Film interface
 */
export function formatTMDBListItem(movie: any): IFilm {
  const year = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;
  const genres = (movie.genre_ids || [])
    .map((gid: number) => TMDB_GENRES[gid])
    .filter(Boolean) as string[];

  // Letterboxd uses a 5-star scale; TMDB is 10-star
  const averageRating = movie.vote_average ? Number((movie.vote_average / 2).toFixed(1)) : 0;

  return {
    id: String(movie.id),
    tmdbId: movie.id,
    title: movie.title || 'Untitled',
    year: isNaN(year) ? 0 : year,
    director: 'Various',
    runtime: 100,
    genres: genres.length > 0 ? genres : ['Cinema'],
    poster: movie.poster_path ? `${TMDB_IMAGE_BASE_POSTER}${movie.poster_path}` : '',
    backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE_BACKDROP}${movie.backdrop_path}` : '',
    averageRating,
    watchedCount: formatCount(movie.vote_count ? Math.round(movie.vote_count * 3) : 0),
    fansCount: formatCount(movie.vote_count ? Math.round(movie.vote_count * 0.4) : 0),
    tagline: '',
    synopsis: movie.overview || '',
    country: 'International',
    language: movie.original_language ? movie.original_language.toUpperCase() : 'English',
    studio: 'Studio',
    cast: [],
    crew: [],
  };
}

/**
 * Transform full TMDB movie details (with credits) into our Film interface
 */
export function formatTMDBFullMovie(movie: any): IFilm {
  const year = movie.release_date ? parseInt(movie.release_date.split('-')[0], 10) : 0;
  const genres = Array.isArray(movie.genres) ? movie.genres.map((g: any) => g.name) : [];

  const director =
    movie.credits?.crew?.find((c: any) => c.job === 'Director')?.name ||
    movie.credits?.crew?.find((c: any) => c.department === 'Directing')?.name ||
    'Unknown';

  const cast = Array.isArray(movie.credits?.cast)
    ? movie.credits.cast.slice(0, 10).map((c: any) => ({
        name: c.name || '',
        role: c.character || 'Cast',
      }))
    : [];

  const crew = Array.isArray(movie.credits?.crew)
    ? movie.credits.crew
        .filter((c: any) => ['Director', 'Screenplay', 'Writer', 'Director of Photography', 'Original Music Composer', 'Producer'].includes(c.job))
        .slice(0, 8)
        .map((c: any) => ({
          name: c.name || '',
          role: c.job || 'Crew',
        }))
    : [];

  const country = movie.production_countries?.[0]?.name || 'United States';
  const language = movie.spoken_languages?.[0]?.english_name || movie.original_language?.toUpperCase() || 'English';
  const studio = movie.production_companies?.[0]?.name || 'Independent';

  const averageRating = movie.vote_average ? Number((movie.vote_average / 2).toFixed(1)) : 0;

  return {
    id: String(movie.id),
    tmdbId: movie.id,
    title: movie.title || 'Untitled',
    year: isNaN(year) ? 0 : year,
    director,
    runtime: movie.runtime || 100,
    genres: genres.length > 0 ? genres : ['Cinema'],
    poster: movie.poster_path ? `${TMDB_IMAGE_BASE_POSTER}${movie.poster_path}` : '',
    backdrop: movie.backdrop_path ? `${TMDB_IMAGE_BASE_BACKDROP}${movie.backdrop_path}` : '',
    averageRating,
    watchedCount: formatCount(movie.vote_count ? Math.round(movie.vote_count * 3) : 0),
    fansCount: formatCount(movie.vote_count ? Math.round(movie.vote_count * 0.4) : 0),
    tagline: movie.tagline || '',
    synopsis: movie.overview || '',
    country,
    language,
    studio,
    cast,
    crew,
  };
}

class TmdbService {
  /**
   * Search movies by query string and optional genre
   */
  async searchMovies(query: string, page = 1, genreName?: string): Promise<{ results: IFilm[]; totalResults: number; page: number }> {
    if (!query || query.trim().length === 0) {
      return { results: [], totalResults: 0, page };
    }

    try {
      const data = await fetchFromTMDB<any>('/search/movie', {
        query: query.trim(),
        page,
        include_adult: 'false',
        language: 'en-US',
      });

      let results: IFilm[] = (data.results || []).map(formatTMDBListItem);

      // Filter by genre if requested
      if (genreName) {
        const lowerGenre = genreName.toLowerCase();
        results = results.filter((f: IFilm) => f.genres.some((g: string) => g.toLowerCase() === lowerGenre));
      }

      // Cache search results in MongoDB Film cache
      results.forEach((film: IFilm) => {
        Film.findOneAndUpdate(
          { id: film.id },
          { ...film, cachedAt: new Date() },
          { upsert: true, setDefaultsOnInsert: true }
        ).catch(() => {});
      });

      return {
        results,
        totalResults: data.total_results || results.length,
        page: data.page || page,
      };
    } catch (error) {
      console.error('[TmdbService] Real-time search error:', (error as Error).message);
      const cachedMatches = await Film.find({
        $or: [
          { title: { $regex: query.trim(), $options: 'i' } },
          { director: { $regex: query.trim(), $options: 'i' } },
        ],
      }).limit(10);

      const results: IFilm[] = cachedMatches.map((doc) => doc.toJSON() as IFilm);
      return { results, totalResults: results.length, page: 1 };
    }
  }

  /**
   * Get full movie details with caching in MongoDB
   */
  async getMovieDetails(id: string | number): Promise<IFilm> {
    const stringId = String(id);

    // 1. Check local MongoDB cache first
    try {
      const cached = await Film.findOne({ id: stringId });
      if (cached && cached.cast && cached.cast.length > 0) {
        const cacheAgeHours = (Date.now() - new Date(cached.cachedAt || 0).getTime()) / (1000 * 60 * 60);
        if (cacheAgeHours < 48) {
          return cached.toJSON() as IFilm;
        }
      }
    } catch (err) {
      console.warn('[TmdbService] MongoDB cache read error:', err);
    }

    // 2. Fetch fresh details from TMDB with credits
    try {
      const movieData = await fetchFromTMDB<any>(`/movie/${stringId}`, {
        append_to_response: 'credits',
        language: 'en-US',
      });

      const formattedFilm = formatTMDBFullMovie(movieData);

      // 3. Cache into MongoDB
      await Film.findOneAndUpdate(
        { id: stringId },
        { ...formattedFilm, cachedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return formattedFilm;
    } catch (error) {
      console.error('[TmdbService] getMovieDetails error:', (error as Error).message);
      const staleCached = await Film.findOne({ id: stringId });
      if (staleCached) {
        return staleCached.toJSON() as IFilm;
      }

      throw new ApiError(404, `Film not found with id: ${id}`);
    }
  }

  /**
   * Get popular movies
   */
  async getPopularMovies(page = 1): Promise<{ results: IFilm[]; page: number }> {
    try {
      const data = await fetchFromTMDB<any>('/movie/popular', {
        page,
        language: 'en-US',
      });

      const results: IFilm[] = (data.results || []).map(formatTMDBListItem);

      // Cache in MongoDB
      results.forEach((film: IFilm) => {
        Film.findOneAndUpdate(
          { id: film.id },
          { ...film, cachedAt: new Date() },
          { upsert: true, setDefaultsOnInsert: true }
        ).catch(() => {});
      });

      return { results, page: data.page || page };
    } catch (error) {
      console.error('[TmdbService] getPopularMovies error:', (error as Error).message);
      const cached = await Film.find().sort({ averageRating: -1 }).limit(18);
      return { results: cached.map((c) => c.toJSON() as IFilm), page: 1 };
    }
  }

  /**
   * Get trending movies
   */
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<{ results: IFilm[] }> {
    try {
      const data = await fetchFromTMDB<any>(`/trending/movie/${timeWindow}`, {
        language: 'en-US',
      });

      const results: IFilm[] = (data.results || []).map(formatTMDBListItem);

      // Cache in MongoDB
      results.forEach((film: IFilm) => {
        Film.findOneAndUpdate(
          { id: film.id },
          { ...film, cachedAt: new Date() },
          { upsert: true, setDefaultsOnInsert: true }
        ).catch(() => {});
      });

      return { results };
    } catch (error) {
      console.error('[TmdbService] getTrendingMovies error:', (error as Error).message);
      const cached = await Film.find().sort({ createdAt: -1 }).limit(12);
      return { results: cached.map((c) => c.toJSON() as IFilm) };
    }
  }

  /**
   * Discover movies with optional genre and sort
   */
  async getDiscoverMovies(options: { genre?: string; sortBy?: string; page?: number } = {}): Promise<{ results: IFilm[]; page: number }> {
    try {
      const params: Record<string, string | number> = {
        page: options.page || 1,
        sort_by: options.sortBy || 'popularity.desc',
        language: 'en-US',
        include_adult: 'false',
      };

      if (options.genre) {
        const genreId = GENRE_NAME_TO_ID[options.genre.toLowerCase()];
        if (genreId) {
          params.with_genres = genreId;
        }
      }

      const data = await fetchFromTMDB<any>('/discover/movie', params);
      const results: IFilm[] = (data.results || []).map(formatTMDBListItem);

      // Cache in MongoDB
      results.forEach((film: IFilm) => {
        Film.findOneAndUpdate(
          { id: film.id },
          { ...film, cachedAt: new Date() },
          { upsert: true, setDefaultsOnInsert: true }
        ).catch(() => {});
      });

      return { results, page: data.page || options.page || 1 };
    } catch (error) {
      console.error('[TmdbService] getDiscoverMovies error:', (error as Error).message);
      const query: Record<string, any> = {};
      if (options.genre) {
        query.genres = { $in: [new RegExp(options.genre, 'i')] };
      }
      const cached = await Film.find(query).limit(18);
      return { results: cached.map((c) => c.toJSON() as IFilm), page: 1 };
    }
  }
}

export const tmdbService = new TmdbService();
export default tmdbService;
