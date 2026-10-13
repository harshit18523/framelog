import React, { useState } from 'react';
import { CalendarDaysIcon, ListIcon, PlusIcon } from 'lucide-react';
import { DiaryCalendar } from '../components/diary/DiaryCalendar';
import { DiaryTimeline } from '../components/diary/DiaryTimeline';
import { Button } from '../components/ui/Button';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { useLibrary } from '../contexts/LibraryContext';
import { TODAY_ISO } from '../utils/dates';
import { getFilm } from '../utils/films';
import { useScreenInit } from '../useScreenInit.js';

type DiaryView = 'timeline' | 'calendar';

export function Diary() {
  const { entries, openLog } = useLibrary();
  const screenInit = useScreenInit() as { diaryView?: DiaryView };
  const [view, setView] = useState<DiaryView>(screenInit.diaryView ?? 'timeline');

  const thisMonth = entries.filter((e) => e.date.startsWith(TODAY_ISO.slice(0, 7)));
  const minutes = thisMonth.reduce(
    (sum, e) => sum + ((e.film as any)?.runtime || getFilm(e.filmId)?.runtime || 110),
    0
  );
  const rated = thisMonth.filter((e) => e.rating != null);
  const average = rated.length ? rated.reduce((s, e) => s + (e.rating ?? 0), 0) / rated.length : 0;

  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[36px] font-semibold leading-tight tracking-display sm:text-[42px]">Diary</h1>
          <p className="mt-1 text-[15px] text-fg-subtle">
            Every film, every night — {entries.length} {entries.length === 1 ? 'entry' : 'entries'} so far.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SegmentedControl<DiaryView>
            label="Diary view"
            layoutId="diary-view"
            value={view}
            onChange={setView}
            options={[
              { id: 'timeline', label: 'Timeline', icon: ListIcon },
              { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
            ]}
          />

          <Button onClick={() => openLog()} className="h-10">
            <PlusIcon size={16} /> Log
          </Button>
        </div>
      </header>

      <dl className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-4 border-y border-line py-6">
        <div>
          <dt className="text-xs text-fg-subtle">{currentMonthName}</dt>
          <dd className="mt-1 text-4xl font-semibold tabular-nums tracking-display">
            {thisMonth.length} <span className="text-base font-medium tracking-normal text-fg-subtle">films</span>
          </dd>
        </div>
        <div className="h-10 w-px bg-line" aria-hidden />
        <div>
          <dt className="text-xs text-fg-subtle">Time in the dark</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">
            {Math.floor(minutes / 60)}h {minutes % 60}m
          </dd>
        </div>
        <div>
          <dt className="text-xs text-fg-subtle">Average rating</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">
            {average ? average.toFixed(1) : '—'} <span className="text-gold">★</span>
          </dd>
        </div>
      </dl>

      <div className="mt-12">{view === 'timeline' ? <DiaryTimeline entries={entries} /> : <DiaryCalendar />}</div>
    </div>
  );
}

export default Diary;
