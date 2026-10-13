import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import { cacheFilms, getFilm } from '../../utils/films';
import { Poster } from '../film/Poster';
import { SectionHeader } from '../ui/SectionHeader';
import { StarRating } from '../ui/StarRating';
import { getPopularFilmsApi } from '../../api/films.api';
import type { Film } from '../../types/film';

export function HomeRail() {
  const { entries } = useLibrary();
  const recent = entries.slice(0, 4);
  const [popular, setPopular] = useState<Film[]>([]);

  useEffect(() => {
    let isMounted = true;
    getPopularFilmsApi()
      .then((res) => {
        if (!isMounted) return;
        if (res.results) {
          cacheFilms(res.results);
          setPopular(res.results.slice(0, 5));
        }
      })
      .catch((err) => console.error('[HomeRail] Error loading popular films:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <aside className="sticky top-24 hidden space-y-12 self-start xl:block" aria-label="Your film week">
      {recent.length > 0 && (
        <section aria-labelledby="recent-diary">
          <SectionHeader
            id="recent-diary"
            title={<span className="text-base">Your recent diary</span>}
            action={{ label: 'Diary', to: '/app/diary' }}
          />
          <ul className="grid grid-cols-4 gap-2.5">
            {recent.map((entry) => {
              const film = (entry.film as any) || getFilm(entry.filmId);
              if (!film) return null;
              return (
                <li key={entry.id}>
                  <Poster film={film} showCaption={false} radius="lg" />
                  {entry.rating != null && <StarRating value={entry.rating} size={9} className="mt-2" />}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {popular.length > 0 && (
        <section aria-labelledby="popular-movies">
          <SectionHeader
            id="popular-movies"
            title={<span className="text-base">Popular now</span>}
            action={{ label: 'More', to: '/app/discover' }}
          />

          <ol className="space-y-1">
            {popular.map((film, i) => (
              <li key={film.id}>
                <Link
                  to={`/app/film/${film.id}`}
                  className="group -mx-2 flex items-center gap-3.5 rounded-xl p-2 transition-colors duration-150 hover:bg-white/[0.04]"
                >
                  <span className="w-4 text-right text-sm font-medium tabular-nums text-fg-faint">
                    {i + 1}
                  </span>
                  {film.poster ? (
                    <img
                      src={film.poster}
                      alt=""
                      className="h-[54px] w-9 rounded-md object-cover ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="grid h-[54px] w-9 place-items-center rounded-md bg-white/[0.06] text-[8px] text-fg-faint">
                      Art
                    </div>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg transition-colors group-hover:text-gold-soft">
                      {film.title}
                    </span>
                    <span className="block text-xs text-fg-subtle">
                      {film.year || '—'} {film.averageRating ? `· ★ ${film.averageRating.toFixed(1)}` : ''}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </aside>
  );
}

export default HomeRail;
