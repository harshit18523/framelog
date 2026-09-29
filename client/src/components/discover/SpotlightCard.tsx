import React from 'react';
import { BookmarkIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary } from '../../contexts/LibraryContext';
import type { Film } from '../../types/film';
import { formatRuntime } from '../../utils/films';
import { Poster } from '../film/Poster';
import { Button, ButtonLink } from '../ui/Button';
import { StarRating } from '../ui/StarRating';

type SpotlightCardProps = {
  film: Film;
};

export function SpotlightCard({ film }: SpotlightCardProps) {
  const { watchlist, toggleWatchlist } = useLibrary();
  const saved = watchlist.includes(film.id);

  return (
    <section
      aria-labelledby="spotlight-title"
      className="relative overflow-hidden rounded-3xl bg-surface ring-1 ring-inset ring-line shadow-elevated">
      
      <img src={film.backdrop ?? film.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div className="absolute inset-0 shadow-[inset_0_-160px_160px_-40px_rgba(9,9,11,0.85)]" aria-hidden />

      <div className="relative flex min-h-[400px] items-end justify-between gap-10 p-6 sm:p-10 lg:min-h-[460px] lg:p-12">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-gold">Most logged this week</p>
          <h2 id="spotlight-title" className="mt-3 text-[40px] font-semibold leading-[1.02] tracking-display sm:text-[56px]">
            {film.title}
          </h2>
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
            {film.year} · {film.director} · {formatRuntime(film.runtime)}
            <span className="inline-flex items-center gap-2">
              <StarRating value={film.averageRating} size={12} /> {film.averageRating.toFixed(1)}
            </span>
          </p>
          <p className="mt-5 line-clamp-3 max-w-lg text-[15px] leading-relaxed text-white/80">{film.synopsis}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to={`/app/film/${film.id}`} size="lg">
              View film
            </ButtonLink>
            <Button
              variant="secondary"
              size="lg"
              aria-pressed={saved}
              onClick={() => {
                toggleWatchlist(film.id);
                toast(saved ? 'Removed from your watchlist' : `${film.title} added to your watchlist`);
              }}
              className="bg-black/30 backdrop-blur-md">
              
              {saved ? <CheckIcon size={17} /> : <BookmarkIcon size={17} />}
              {saved ? 'On watchlist' : 'Watchlist'}
            </Button>
          </div>
        </div>
        <Poster film={film} linked={false} eager className="hidden w-48 shrink-0 lg:block xl:w-56" />
      </div>
    </section>);

}