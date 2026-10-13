import React from 'react';
import { HeartIcon } from 'lucide-react';
import type { FeatureVisualKind } from '../../data/marketing';
import { getUser } from '../../utils/films';
import { Avatar } from '../ui/Avatar';
import { StarRating } from '../ui/StarRating';

type FeatureVisualProps = {
  kind: FeatureVisualKind;
};

const panel = 'rounded-3xl bg-surface p-6 ring-1 ring-inset ring-line shadow-elevated sm:p-8';

const SAMPLE_ENTRIES = [
  {
    day: '27',
    title: 'Oppenheimer',
    year: 2023,
    poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    rating: 5,
  },
  {
    day: '24',
    title: 'Dune: Part Two',
    year: 2024,
    poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    rating: 4.5,
  },
  {
    day: '21',
    title: 'Interstellar',
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    rating: 4.5,
  },
  {
    day: '18',
    title: 'Parasite',
    year: 2019,
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    rating: 5,
  },
];

export function FeatureVisual({ kind }: FeatureVisualProps) {
  if (kind === 'track') {
    return (
      <div className={panel}>
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <p className="text-lg font-semibold tracking-title">October</p>
          <p className="text-sm text-fg-subtle">4 films · 10h 42m</p>
        </div>
        <ul>
          {SAMPLE_ENTRIES.map((entry, idx) => (
            <li key={idx} className="flex items-center gap-5 border-b border-line py-4 last:border-0 last:pb-0">
              <span className="w-7 text-center text-xl font-semibold tabular-nums">{entry.day}</span>
              <img src={entry.poster} alt="" className="h-14 w-[38px] rounded-md object-cover ring-1 ring-white/10" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{entry.title}</span>
                <span className="text-xs text-fg-subtle">{entry.year}</span>
              </span>
              <StarRating value={entry.rating} size={12} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (kind === 'review') {
    const user = getUser('ines');
    return (
      <div className={panel}>
        <div className="flex gap-6">
          <img
            src="https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
            alt=""
            className="hidden aspect-[2/3] w-28 shrink-0 rounded-xl object-cover shadow-poster ring-1 ring-white/10 sm:block"
          />
          <div>
            <div className="flex items-center gap-3">
              <Avatar user={user} size="sm" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <StarRating value={5} size={11} />
              </div>
            </div>
            <p className="mt-5 text-xl font-medium leading-[1.5] tracking-[-0.01em] text-fg">
              “A monumental achievement in cinematic biography. The auditory landscape and tension are completely overwhelming.”
            </p>
            <p className="mt-5 flex items-center gap-4 text-sm text-fg-subtle">
              <span>Oppenheimer, 2023</span>
              <span className="inline-flex items-center gap-1.5 text-gold">
                <HeartIcon size={14} fill="currentColor" /> 312
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'discover') {
    const posters = [
      { title: 'Inception', poster: 'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg' },
      { title: 'Interstellar', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
      { title: 'Dune', poster: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
    ];

    return (
      <div className={`${panel} overflow-hidden`}>
        <p className="text-sm text-fg-subtle">
          Because you loved <span className="text-fg">Christopher Nolan</span>
        </p>
        <div className="mt-8 flex items-end justify-center gap-4 pb-2">
          {posters.map((film, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-xl ring-1 ring-white/10 ${
                i === 1 ? 'w-[40%] shadow-poster-hover' : 'w-[28%] opacity-70 shadow-poster'
              }`}
            >
              <img src={film.poster} alt="" className="aspect-[2/3] w-full object-cover" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm">
          <span className="font-medium">Interstellar</span>
          <span className="text-fg-subtle"> · loved by 4 people you follow</span>
        </p>
      </div>
    );
  }

  const feed = [
    {
      userId: 'jonah',
      verb: 'is watching',
      title: 'Dune: Part Two',
      time: 'Now',
      live: true,
    },
    {
      userId: 'hana',
      verb: 'rated',
      title: 'Parasite',
      time: '5h',
      rating: 5,
    },
    {
      userId: 'theo',
      verb: 'added to a list',
      title: 'Oppenheimer',
      time: '8h',
    },
    {
      userId: 'ada',
      verb: 'rewatched',
      title: 'Inception',
      time: '1d',
      rating: 4.5,
    },
  ];

  return (
    <div className={panel}>
      <ul className="space-y-1">
        {feed.map((item, idx) => {
          const user = getUser(item.userId);
          return (
            <li key={idx} className="flex items-center gap-4 py-3">
              <Avatar user={user} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-fg-subtle">
                  <span className="font-medium text-fg">{user.name.split(' ')[0]}</span> {item.verb}
                </p>
                <p className="truncate text-[15px] font-medium">{item.title}</p>
              </div>
              {item.rating != null && <StarRating value={item.rating} size={11} />}
              <span className={`flex items-center gap-1.5 text-xs ${item.live ? 'text-gold' : 'text-fg-faint'}`}>
                {item.live && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                {item.time}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FeatureVisual;
