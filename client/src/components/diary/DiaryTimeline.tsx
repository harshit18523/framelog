import React, { useMemo } from 'react';
import type { DiaryEntry } from '../../types/film';
import { formatDay } from '../../utils/dates';
import { DiaryRow } from './DiaryRow';

type DiaryTimelineProps = {
  entries: DiaryEntry[];
  compact?: boolean;
};

export function DiaryTimeline({ entries, compact }: DiaryTimelineProps) {
  const groups = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>();
    [...entries].
    sort((a, b) => b.date.localeCompare(a.date)).
    forEach((entry) => {
      const key = entry.date.slice(0, 7);
      map.set(key, [...(map.get(key) ?? []), entry]);
    });
    return [...map.entries()];
  }, [entries]);

  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
        <p className="text-[15px] font-medium">Your diary is waiting</p>
        <p className="mt-1.5 text-sm text-fg-subtle">Log your first film and it will appear here.</p>
      </div>);

  }

  return (
    <div className="space-y-16">
      {groups.map(([key, items]) =>
      <section
        key={key}
        aria-label={formatDay(`${key}-01`, 'MMMM yyyy')}
        className={`grid gap-4 ${compact ? '' : 'md:grid-cols-[200px_minmax(0,1fr)] md:gap-10'}`}>
        
          <header className={compact ? 'flex items-baseline gap-3' : 'md:sticky md:top-24 md:self-start'}>
            <h2 className="text-2xl font-semibold tracking-title">{formatDay(`${key}-01`, 'MMMM')}</h2>
            <p className={`text-sm text-fg-subtle ${compact ? '' : 'mt-1'}`}>
              {formatDay(`${key}-01`, 'yyyy')} · {items.length} {items.length === 1 ? 'film' : 'films'}
            </p>
          </header>
          <ol className="border-t border-line">
            {items.map((entry) =>
          <DiaryRow key={entry.id} entry={entry} />
          )}
          </ol>
        </section>
      )}
    </div>);

}