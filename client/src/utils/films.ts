import { films } from '../data/films';
import { currentUser, users } from '../data/users';
import type { Film } from '../types/film';
import type { User } from '../types/social';

export function getFilm(id: string | undefined): Film | undefined {
  return films.find((film) => film.id === id);
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
  return films.filter((film) => {
    const matchesGenre = genre ? film.genres.includes(genre) : true;
    const matchesQuery = q ?
    [film.title, film.director, ...film.genres, ...film.cast.map((c) => c.name)].
    join(' ').
    toLowerCase().
    includes(q) :
    true;
    return matchesGenre && matchesQuery;
  });
}