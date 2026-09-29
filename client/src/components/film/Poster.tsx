import React from 'react';
import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import type { Film } from '../../types/film';

type PosterProps = {
  film: Film;
  linked?: boolean;
  showCaption?: boolean;
  className?: string;
  radius?: 'md' | 'lg' | 'xl';
  eager?: boolean;
};

const radii = { md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl' };

export function Poster({ film, linked = true, showCaption = true, className, radius = 'xl', eager }: PosterProps) {
  const r = radii[radius];

  const body =
  <span
    className={twMerge(
      'relative block aspect-[2/3] w-full overflow-hidden bg-surface-raised shadow-poster',
      'transition-[transform,box-shadow] duration-300 ease-cinema',
      linked && 'group-hover/poster:-translate-y-1 group-hover/poster:shadow-poster-hover',
      r
    )}>
    
      <img
      src={film.poster}
      alt={linked ? '' : `${film.title} (${film.year}) poster`}
      loading={eager ? 'eager' : 'lazy'}
      draggable={false}
      className={twMerge(
        'h-full w-full object-cover transition-transform duration-300 ease-cinema',
        linked && 'group-hover/poster:scale-[1.035]'
      )} />
    
      <span aria-hidden className={`pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10 ${r}`} />
      {linked && showCaption &&
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-2 bottom-2 translate-y-1.5 rounded-lg bg-black/55 px-2.5 py-2 opacity-0 ring-1 ring-inset ring-white/10 backdrop-blur-md transition-[opacity,transform] duration-200 ease-cinema group-hover/poster:translate-y-0 group-hover/poster:opacity-100">
      
          <span className="block truncate text-[12px] font-medium leading-tight text-fg">{film.title}</span>
          <span className="mt-0.5 block text-[11px] text-fg-muted">
            {film.year} · {film.director}
          </span>
        </span>
    }
    </span>;


  if (!linked) return <div className={twMerge('block', className)}>{body}</div>;

  return (
    <Link
      to={`/app/film/${film.id}`}
      aria-label={`${film.title} (${film.year})`}
      className={twMerge(
        'group/poster block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas',
        className
      )}>
      
      {body}
    </Link>);

}