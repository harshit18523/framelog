import { currentUser, users } from '../data/users';
import type { Film } from '../types/film';
import type { User } from '../types/social';

// In-memory runtime cache for real TMDB films loaded by the app
const filmsCache = new Map<string, Film>();

export function cacheFilm(film: Film | undefined) {
  if (film && film.id) {
    filmsCache.set(String(film.id), film);
  }
}

export function cacheFilms(filmsList: Film[] | undefined) {
  if (Array.isArray(filmsList)) {
    filmsList.forEach(cacheFilm);
  }
}

export function getAllCachedFilms(): Film[] {
  return Array.from(filmsCache.values());
}

export function getFilm(id: string | undefined): Film | undefined {
  if (!id) return undefined;
  return filmsCache.get(String(id));
}

export function getFilms(ids: string[]): Film[] {
  return ids.map((id) => getFilm(id)).filter((film): film is Film => Boolean(film));
}

export function getUser(id: string): User {
  return users.find((user) => user.id === id) ?? currentUser;
}

export function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h ${rest.toString().padStart(2, '0')}m` : `${rest}m`;
}

export function searchFilms(query: string, genre?: string | null): Film[] {
  const q = query.trim().toLowerCase();
  const allFilms = getAllCachedFilms();
  return allFilms.filter((film) => {
    const matchesGenre = genre ? film.genres.some((g) => g.toLowerCase() === genre.toLowerCase()) : true;
    const matchesQuery = q
      ? [film.title, film.director, ...film.genres, ...film.cast.map((c) => c.name)]
          .join(' ')
          .toLowerCase()
          .includes(q)
      : true;
    return matchesGenre && matchesQuery;
  });
}
