import React from 'react';
import { HeartIcon, RepeatIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DiaryEntry } from '../../types/film';
import { formatDay } from '../../utils/dates';
import { getFilm } from '../../utils/films';
import { Poster } from '../film/Poster';
import { StarRating } from '../ui/StarRating';

type DiaryRowProps = {
  entry: DiaryEntry;
};

export function DiaryRow({ entry }: DiaryRowProps) {
  const film = (entry.film as any) || getFilm(entry.filmId);
  if (!film) return null;

  return (
    <li className="grid grid-cols-[40px_52px_minmax(0,1fr)] items-center gap-4 border-b border-line py-4 sm:grid-cols-[52px_56px_minmax(0,1fr)_auto] sm:gap-6">
      <div className="text-center">
        <p className="text-[26px] font-semibold leading-none tabular-nums tracking-title text-fg">
          {formatDay(entry.date, 'd')}
        </p>
        <p className="mt-1.5 text-[11px] text-fg-faint">{formatDay(entry.date, 'EEE')}</p>
      </div>

      <Poster film={film} showCaption={false} radius="md" />

      <div className="min-w-0">
        <p className="truncate">
          <Link to={`/app/film/${film.id}`} className="text-[15px] font-semibold text-fg transition-colors hover:text-gold-soft">
            {film.title}
          </Link>
          <span className="ml-2 text-sm text-fg-subtle">{film.year}</span>
        </p>
        {entry.review ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-fg-subtle">{entry.review}</p>
        ) : (
          <p className="mt-1 text-sm text-fg-faint">Directed by {film.director}</p>
        )}
        <div className="mt-2 sm:hidden">
          {entry.rating != null && <StarRating value={entry.rating} size={12} />}
        </div>
      </div>

      <div className="hidden items-center gap-4 sm:flex">
        {entry.rating != null ? (
          <StarRating value={entry.rating} size={14} />
        ) : (
          <span className="w-[78px] text-right text-xs text-fg-faint">Not rated</span>
        )}
        <span className="flex w-10 items-center justify-end gap-2 text-fg-subtle">
          {entry.liked && <HeartIcon size={14} fill="currentColor" className="text-gold" aria-label="Liked" />}
          {entry.rewatch && <RepeatIcon size={14} aria-label="Rewatch" />}
        </span>
      </div>
    </li>
  );
}

export default DiaryRow;
