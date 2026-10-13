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

export function ProfileFilmsGrid() {
  const { entries, liked } = useLibrary();
  const [sort, setSort] = useState<SortKey>('recent');

  const items = useMemo(() => {
    const list: Array<{
      film: Film;
      date: string;
      rating: number;
      rewatch: boolean;
      liked: boolean;
    }> = [];

    entries.forEach((entry) => {
      const film = ((entry.film as unknown) as Film) || getFilm(entry.filmId);
      if (film) {
        list.push({
          film,
          date: entry.date,
          rating: entry.rating ?? Math.round(film.averageRating * 2) / 2,
          rewatch: entry.rewatch ?? false,
          liked: liked.includes(film.id),
        });
      }
    });

    return list.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'year') return b.film.year - a.film.year;
      return b.date.localeCompare(a.date);
    });
  }, [entries, liked, sort]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
        <p className="text-[15px] font-medium">No films logged yet</p>
        <p className="mt-1.5 text-sm text-fg-subtle">Films you log in your diary will collect here.</p>
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
