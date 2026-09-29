import React from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import { popularWithFriends } from '../../data/discover';
import { getFilm } from '../../utils/films';
import { Poster } from '../film/Poster';
import { SectionHeader } from '../ui/SectionHeader';
import { StarRating } from '../ui/StarRating';

export function HomeRail() {
  const { entries } = useLibrary();
  const recent = entries.slice(0, 4);

  return (
    <aside className="sticky top-24 hidden space-y-12 self-start xl:block" aria-label="Your film week">
      <section aria-labelledby="recent-diary">
        <SectionHeader id="recent-diary" title={<span className="text-base">Your recent diary</span>} action={{ label: 'Diary', to: '/app/diary' }} />
        <ul className="grid grid-cols-4 gap-2.5">
          {recent.map((entry) => {
            const film = getFilm(entry.filmId);
            if (!film) return null;
            return (
              <li key={entry.id}>
                <Poster film={film} showCaption={false} radius="lg" />
                {entry.rating != null && <StarRating value={entry.rating} size={9} className="mt-2" />}
              </li>);

          })}
        </ul>
      </section>

      <section aria-labelledby="friends-popular">
        <SectionHeader
          id="friends-popular"
          title={<span className="text-base">Popular with friends</span>}
          action={{ label: 'More', to: '/app/discover' }} />
        
        <ol className="space-y-1">
          {popularWithFriends.slice(0, 5).map((item, i) => {
            const film = getFilm(item.filmId);
            if (!film) return null;
            return (
              <li key={item.filmId}>
                <Link
                  to={`/app/film/${film.id}`}
                  className="group -mx-2 flex items-center gap-3.5 rounded-xl p-2 transition-colors duration-150 hover:bg-white/[0.04]">
                  
                  <span className="w-4 text-right text-sm font-medium tabular-nums text-fg-faint">{i + 1}</span>
                  <img src={film.poster} alt="" className="h-[54px] w-9 rounded-md object-cover ring-1 ring-white/10" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg transition-colors group-hover:text-gold-soft">
                      {film.title}
                    </span>
                    <span className="block text-xs text-fg-subtle">{item.count} friends watched</span>
                  </span>
                </Link>
              </li>);

          })}
        </ol>
      </section>
    </aside>);

}