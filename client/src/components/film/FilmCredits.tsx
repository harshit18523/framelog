import React, { useState } from 'react';
import type { Film } from '../../types/film';
import { formatRuntime } from '../../utils/films';
import { Tabs } from '../ui/Tabs';

type CreditsTab = 'cast' | 'crew' | 'details';

type FilmCreditsProps = {
  film: Film;
};

export function FilmCredits({ film }: FilmCreditsProps) {
  const [tab, setTab] = useState<CreditsTab>('cast');

  const rows =
    tab === 'cast'
      ? film.cast.map((c) => ({ label: c.name, value: c.role }))
      : tab === 'crew'
      ? film.crew.map((c) => ({ label: c.role, value: c.name }))
      : [
          { label: 'Studio', value: film.studio },
          { label: 'Country', value: film.country },
          { label: 'Language', value: film.language },
          { label: 'Runtime', value: formatRuntime(film.runtime) },
          { label: 'Genres', value: film.genres.join(', ') },
        ];

  return (
    <section aria-label="Cast and crew">
      <div className="border-b border-line">
        <Tabs<CreditsTab>
          label="Film credits"
          layoutId="credits-tabs"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'cast', label: 'Cast' },
            { id: 'crew', label: 'Crew' },
            { id: 'details', label: 'Details' },
          ]}
        />
      </div>
      <dl className="grid gap-x-10 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-line py-3.5">
            <dt className={tab === 'cast' ? 'text-sm font-medium text-fg' : 'text-sm text-fg-subtle'}>{row.label}</dt>
            <dd className={tab === 'cast' ? 'text-right text-sm text-fg-subtle' : 'text-right text-sm text-fg'}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}