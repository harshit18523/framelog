import React, { useMemo, useState } from 'react';
import { HeartIcon, RepeatIcon } from 'lucide-react';
import { useLibrary } from '../../contexts/LibraryContext';
import { getFilm } from '../../utils/films';
import { Poster } from '../film/Poster';
import { StarRating } from '../ui/StarRating';
import { ButtonLink } from '../ui/Button';
import type { Film } from '../../types/film';

type SortKey = 'recent' | 'rating' | 'year';

const sortOptions: { id: SortKey; label: string }[] = [
  { id: 'recent', label: 'Recently watched' },
  { id: 'rating', label: 'Highest rated' },
  { id: 'year', label: 'Release year' },
];

interface FilmGridItem {
  film: Film;
  date: string;
  dateSortValue: number;
  rating: number;
  userRated: boolean;
  rewatch: boolean;
  liked: boolean;
}

export function ProfileFilmsGrid() {
  const { entries, liked, watched, watchedItems } = useLibrary();
  const [sort, setSort] = useState<SortKey>('recent');

  const items = useMemo(() => {
    const filmMap = new Map<string, FilmGridItem>();

    // 1. Process diary entries (which have specific logged dates, ratings, and reviews)
    entries.forEach((entry) => {
      const film = ((entry.film as unknown) as Film) || getFilm(entry.filmId);
      if (!film || !film.id) return;

      const dateStr = entry.date || '';
      const timestamp = dateStr ? new Date(dateStr).getTime() : 0;
      const validTimestamp = isNaN(timestamp) ? 0 : timestamp;
      const entryRating = entry.rating != null ? entry.rating : undefined;

      const existing = filmMap.get(film.id);
      if (!existing) {
        filmMap.set(film.id, {
          film,
          date: dateStr,
          dateSortValue: validTimestamp,
          rating: entryRating ?? (film.averageRating ? Math.round(film.averageRating * 2) / 2 : 0),
          userRated: entryRating != null,
          rewatch: Boolean(entry.rewatch),
          liked: liked.includes(film.id) || Boolean(entry.liked),
        });
      } else {
        // Deduplicate: merge into the single unique film entry
        if (validTimestamp > existing.dateSortValue) {
          existing.date = dateStr;
          existing.dateSortValue = validTimestamp;
        }
        if (entryRating != null && !existing.userRated) {
          existing.rating = entryRating;
          existing.userRated = true;
        } else if (entryRating != null && entryRating > existing.rating) {
          existing.rating = entryRating;
        }
        if (entry.rewatch) existing.rewatch = true;
        if (entry.liked || liked.includes(film.id)) existing.liked = true;
      }
    });

    // 2. Process watched items (films marked as watched directly)
    watchedItems.forEach((item) => {
      const film = ((item.film as unknown) as Film) || getFilm(item.filmId);
      if (!film || !film.id) return;

      const dateStr = item.createdAt ? item.createdAt.slice(0, 10) : '';
      const timestamp = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      const validTimestamp = isNaN(timestamp) ? 0 : timestamp;

      const existing = filmMap.get(film.id);
      if (!existing) {
        filmMap.set(film.id, {
          film,
          date: dateStr,
          dateSortValue: validTimestamp,
          rating: film.averageRating ? Math.round(film.averageRating * 2) / 2 : 0,
          userRated: false,
          rewatch: false,
          liked: liked.includes(film.id),
        });
      } else {
        if (validTimestamp > existing.dateSortValue && !existing.date) {
          existing.date = dateStr;
          existing.dateSortValue = validTimestamp;
        }
        if (liked.includes(film.id)) existing.liked = true;
      }
    });

    // 3. Fallback for any film IDs in watched list without full item object
    watched.forEach((filmId) => {
      if (filmMap.has(filmId)) return;
      const film = getFilm(filmId);
      if (!film || !film.id) return;

      filmMap.set(film.id, {
        film,
        date: '',
        dateSortValue: 0,
        rating: film.averageRating ? Math.round(film.averageRating * 2) / 2 : 0,
        userRated: false,
        rewatch: false,
        liked: liked.includes(film.id),
      });
    });

    // 4. Return an immutably sorted list
    const uniqueList = Array.from(filmMap.values());

    return uniqueList.sort((a, b) => {
      if (sort === 'rating') {
        const diff = (b.rating ?? 0) - (a.rating ?? 0);
        if (diff !== 0) return diff;
        return b.dateSortValue - a.dateSortValue;
      }
      if (sort === 'year') {
        const yearA = Number(a.film.year) || 0;
        const yearB = Number(b.film.year) || 0;
        const diff = yearB - yearA;
        if (diff !== 0) return diff;
        return (a.film.title || '').localeCompare(b.film.title || '');
      }
      // 'recent'
      const timeDiff = b.dateSortValue - a.dateSortValue;
      if (timeDiff !== 0) return timeDiff;
      return (b.date || '').localeCompare(a.date || '');
    });
  }, [entries, liked, watched, watchedItems, sort]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
        <p className="text-[15px] font-medium">No films watched yet</p>
        <p className="mt-1.5 text-sm text-fg-subtle">
          Films you mark as watched or log in your diary will collect here.
        </p>
        <ButtonLink to="/app/discover" variant="secondary" size="sm" className="mt-5">
          Discover films
        </ButtonLink>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-fg-subtle">
          Showing {items.length} {items.length === 1 ? 'film' : 'films'}
        </p>
        <label className="flex items-center gap-2 text-sm text-fg-subtle">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 cursor-pointer rounded-full bg-white/[0.05] px-3.5 text-sm text-fg ring-1 ring-inset ring-line focus:outline-none focus:ring-gold/50"
          >
            {sortOptions.map((o) => (
              <option key={o.id} value={o.id} className="bg-surface-raised">
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 md:grid-cols-5 xl:grid-cols-6 xl:gap-x-6 xl:gap-y-10">
        {items.map(({ film, rating, rewatch, liked: isLiked }) => (
          <li key={film.id}>
            <Poster film={film} />
            <div className="mt-3 flex h-4 items-center gap-2 px-0.5">
              <StarRating value={rating} size={11} />
              {isLiked && <HeartIcon size={11} fill="currentColor" className="text-gold" aria-label="Liked" />}
              {rewatch && <RepeatIcon size={11} className="text-fg-subtle" aria-label="Rewatched" />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfileFilmsGrid;
