import React, { useMemo, useState } from 'react';
import { HeartIcon, RepeatIcon } from 'lucide-react';
import { useLibrary } from '../../contexts/LibraryContext';
import { films } from '../../data/films';
import { Poster } from '../film/Poster';
import { StarRating } from '../ui/StarRating';

type SortKey = 'recent' | 'rating' | 'year';

const sortOptions: {id: SortKey;label: string;}[] = [
{ id: 'recent', label: 'Recently watched' },
{ id: 'rating', label: 'Highest rated' },
{ id: 'year', label: 'Release year' }];


export function ProfileFilmsGrid() {
  const { entries, liked } = useLibrary();
  const [sort, setSort] = useState<SortKey>('recent');

  const items = useMemo(() => {
    const rows = films.map((film) => {
      const entry = entries.find((e) => e.filmId === film.id);
      return {
        film,
        date: entry?.date ?? '2026-01-01',
        rating: entry?.rating ?? Math.round(film.averageRating * 2) / 2,
        rewatch: entry?.rewatch ?? false,
        liked: liked.includes(film.id)
      };
    });
    return rows.sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'year') return b.film.year - a.film.year;
      return b.date.localeCompare(a.date);
    });
  }, [entries, liked, sort]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <p className="text-sm text-fg-subtle">Showing {items.length} of 1,284 films</p>
        <label className="flex items-center gap-2 text-sm text-fg-subtle">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 cursor-pointer rounded-full bg-white/[0.05] px-3.5 text-sm text-fg ring-1 ring-inset ring-line focus:outline-none focus:ring-gold/50">
            
            {sortOptions.map((o) =>
            <option key={o.id} value={o.id} className="bg-surface-raised">
                {o.label}
              </option>
            )}
          </select>
        </label>
      </div>
      <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 md:grid-cols-5 xl:grid-cols-6 xl:gap-x-6 xl:gap-y-10">
        {items.map(({ film, rating, rewatch, liked: isLiked }) =>
        <li key={film.id}>
            <Poster film={film} />
            <div className="mt-3 flex h-4 items-center gap-2 px-0.5">
              <StarRating value={rating} size={11} />
              {isLiked && <HeartIcon size={11} fill="currentColor" className="text-gold" aria-label="Liked" />}
              {rewatch && <RepeatIcon size={11} className="text-fg-subtle" aria-label="Rewatched" />}
            </div>
          </li>
        )}
      </ul>
    </div>);

}