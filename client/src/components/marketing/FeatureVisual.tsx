import React from 'react';
import { HeartIcon } from 'lucide-react';
import type { FeatureVisualKind } from '../../data/marketing';
import { initialDiary } from '../../data/library';
import { formatDay } from '../../utils/dates';
import { getFilm, getFilms, getUser } from '../../utils/films';
import { Avatar } from '../ui/Avatar';
import { StarRating } from '../ui/StarRating';

type FeatureVisualProps = {
  kind: FeatureVisualKind;
};

const panel = 'rounded-3xl bg-surface p-6 ring-1 ring-inset ring-line shadow-elevated sm:p-8';

export function FeatureVisual({ kind }: FeatureVisualProps) {
  if (kind === 'track') {
    return (
      <div className={panel}>
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <p className="text-lg font-semibold tracking-title">September</p>
          <p className="text-sm text-fg-subtle">7 films · 14h 32m</p>
        </div>
        <ul>
          {initialDiary.slice(0, 4).map((entry) => {
            const film = getFilm(entry.filmId);
            if (!film) return null;
            return (
              <li key={entry.id} className="flex items-center gap-5 border-b border-line py-4 last:border-0 last:pb-0">
                <span className="w-7 text-center text-xl font-semibold tabular-nums">{formatDay(entry.date, 'd')}</span>
                <img src={film.poster} alt="" className="h-14 w-[38px] rounded-md object-cover ring-1 ring-white/10" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{film.title}</span>
                  <span className="text-xs text-fg-subtle">{film.year}</span>
                </span>
                {entry.rating != null && <StarRating value={entry.rating} size={12} />}
              </li>);

          })}
        </ul>
      </div>);

  }

  if (kind === 'review') {
    const film = getFilm('saint-agnes');
    const user = getUser('ines');
    if (!film) return null;
    return (
      <div className={panel}>
        <div className="flex gap-6">
          <img src={film.poster} alt="" className="hidden aspect-[2/3] w-28 shrink-0 rounded-xl object-cover shadow-poster ring-1 ring-white/10 sm:block" />
          <div>
            <div className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <StarRating value={5} size={11} />
              </div>
            </div>
            <p className="mt-5 text-xl font-medium leading-[1.5] tracking-[-0.01em] text-fg">
              “A candle-lit fever dream. The way Hollis lets the silence do all the talking — masterpiece.”
            </p>
            <p className="mt-5 flex items-center gap-4 text-sm text-fg-subtle">
              <span>
                {film.title}, {film.year}
              </span>
              <span className="inline-flex items-center gap-1.5 text-gold">
                <HeartIcon size={14} fill="currentColor" /> 204
              </span>
            </p>
          </div>
        </div>
      </div>);

  }

  if (kind === 'discover') {
    const [left, center, right] = getFilms(['undertow', 'nocturne-for-tokyo', 'low-orbit']);
    return (
      <div className={`${panel} overflow-hidden`}>
        <p className="text-sm text-fg-subtle">
          Because you loved <span className="text-fg">The Quiet Hours</span>
        </p>
        <div className="mt-8 flex items-end justify-center gap-4 pb-2">
          {[left, center, right].map((film, i) =>
          <div
            key={film.id}
            className={`overflow-hidden rounded-xl ring-1 ring-white/10 ${
            i === 1 ? 'w-[40%] shadow-poster-hover' : 'w-[28%] opacity-70 shadow-poster'}`
            }>
            
              <img src={film.poster} alt="" className="aspect-[2/3] w-full object-cover" />
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <span className="font-medium">{center.title}</span>
          <span className="text-fg-subtle"> · loved by 4 people you follow</span>
        </p>
      </div>);

  }

  const feed = [
  { userId: 'jonah', verb: 'is watching', filmId: 'low-orbit', time: 'Now', live: true },
  { userId: 'hana', verb: 'rated', filmId: 'nocturne-for-tokyo', time: '5h', rating: 4 },
  { userId: 'theo', verb: 'added to a list', filmId: 'undertow', time: '8h' },
  { userId: 'ada', verb: 'rewatched', filmId: 'paper-moons', time: '1d', rating: 4.5 }];


  return (
    <div className={panel}>
      <ul className="space-y-1">
        {feed.map((item) => {
          const user = getUser(item.userId);
          const film = getFilm(item.filmId);
          if (!film) return null;
          return (
            <li key={item.userId} className="flex items-center gap-4 py-3">
              <Avatar user={user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg-subtle">
                  <span className="font-medium text-fg">{user.name.split(' ')[0]}</span> {item.verb}
                </p>
                <p className="truncate text-[15px] font-medium">{film.title}</p>
              </div>
              {item.rating != null && <StarRating value={item.rating} size={11} />}
              <span className={`flex items-center gap-1.5 text-xs ${item.live ? 'text-gold' : 'text-fg-faint'}`}>
                {item.live && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                {item.time}
              </span>
            </li>);

        })}
      </ul>
    </div>);

}