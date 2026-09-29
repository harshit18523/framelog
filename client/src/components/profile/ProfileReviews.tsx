import React from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import { formatDay } from '../../utils/dates';
import { getFilm } from '../../utils/films';
import { Poster } from '../film/Poster';
import { StarRating } from '../ui/StarRating';

export function ProfileReviews() {
  const { entries } = useLibrary();
  const reviewed = entries.filter((e) => e.review);

  if (reviewed.length === 0) {
    return <p className="py-16 text-center text-sm text-fg-subtle">No reviews yet.</p>;
  }

  return (
    <ul className="max-w-3xl divide-y divide-line">
      {reviewed.map((entry) => {
        const film = getFilm(entry.filmId);
        if (!film) return null;
        return (
          <li key={entry.id} className="flex gap-6 py-8 first:pt-0">
            <Poster film={film} showCaption={false} className="w-20 shrink-0 sm:w-24" />
            <article className="min-w-0">
              <p>
                <Link to={`/app/film/${film.id}`} className="text-lg font-semibold tracking-title hover:text-gold-soft">
                  {film.title}
                </Link>
                <span className="ml-2 text-sm text-fg-subtle">{film.year}</span>
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                {entry.rating != null && <StarRating value={entry.rating} />}
                <time className="text-xs text-fg-faint">Watched {formatDay(entry.date, 'MMM d, yyyy')}</time>
              </div>
              <p className="mt-3 text-[15px] leading-[1.7] text-fg-muted">{entry.review}</p>
            </article>
          </li>);

      })}
    </ul>);

}