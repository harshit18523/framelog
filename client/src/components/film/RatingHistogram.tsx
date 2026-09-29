import React from 'react';
import type { Film } from '../../types/film';
import { ratingDistribution } from '../../utils/ratings';
import { StarRating } from '../ui/StarRating';

type RatingHistogramProps = {
  film: Film;
};

export function RatingHistogram({ film }: RatingHistogramProps) {
  const bars = ratingDistribution(film.averageRating);
  return (
    <section aria-labelledby="ratings-heading" className="px-1">
      <div className="flex items-baseline justify-between">
        <h2 id="ratings-heading" className="text-xs text-fg-subtle">
          Ratings
        </h2>
        <p className="text-xs text-fg-faint">{film.fansCount} fans</p>
      </div>
      <div className="mt-3 flex items-end gap-5">
        <div>
          <p className="text-4xl font-semibold tabular-nums tracking-display">{film.averageRating.toFixed(1)}</p>
          <StarRating value={film.averageRating} size={10} className="mt-1.5" />
        </div>
        <div className="flex h-14 flex-1 items-end gap-[3px]" role="img" aria-label="Distribution of member ratings">
          {bars.map((value, i) =>
          <div
            key={i}
            title={`${(i + 1) / 2} stars`}
            className={`flex-1 rounded-t-[3px] ${
            (i + 1) / 2 === Math.round(film.averageRating * 2) / 2 ? 'bg-gold' : 'bg-white/[0.14]'}`
            }
            style={{ height: `${Math.max(6, value * 100)}%` }} />

          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-fg-faint">Watched by {film.watchedCount} members</p>
    </section>);

}