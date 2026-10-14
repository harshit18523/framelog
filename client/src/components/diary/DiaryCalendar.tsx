import React, { useMemo, useState } from 'react';
import { addMonths, format, getDay, getDaysInMonth, parseISO, startOfMonth } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import type { DiaryEntry } from '../../types/film';
import { TODAY_ISO } from '../../utils/dates';
import { getFilm } from '../../utils/films';
import { StarRating } from '../ui/StarRating';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DiaryCalendar() {
  const { entries, openLog } = useLibrary();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const isCurrentMonth = format(month, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  const byDate = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>();
    entries.forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]));
    return map;
  }, [entries]);

  const offset = (getDay(month) + 6) % 7;
  const days = Array.from({ length: getDaysInMonth(month) }, (_, i) => i + 1);
  const monthCount = entries.filter((e) => e.date.startsWith(format(month, 'yyyy-MM'))).length;

  return (
    <section aria-label={`Calendar for ${format(month, 'MMMM yyyy')}`}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl font-semibold tracking-title">{format(month, 'MMMM yyyy')}</h2>
          <p className="text-sm text-fg-subtle">
            {monthCount} {monthCount === 1 ? 'film' : 'films'}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="grid h-9 w-9 place-items-center rounded-full text-fg-muted ring-1 ring-inset ring-line transition-colors hover:bg-white/[0.06] hover:text-fg">
            
            <ChevronLeftIcon size={16} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={isCurrentMonth}
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="grid h-9 w-9 place-items-center rounded-full text-fg-muted ring-1 ring-inset ring-line transition-colors hover:bg-white/[0.06] hover:text-fg disabled:pointer-events-none disabled:opacity-30">
            
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
        {weekdays.map((day) =>
        <div key={day} className="pb-2 text-center text-xs text-fg-faint">
            {day}
          </div>
        )}
        {Array.from({ length: offset }, (_, i) =>
        <div key={`pad-${i}`} aria-hidden />
        )}
        {days.map((day) => {
          const iso = format(new Date(month.getFullYear(), month.getMonth(), day), 'yyyy-MM-dd');
          const dayEntries = byDate.get(iso) ?? [];
          const film = dayEntries[0] ? getFilm(dayEntries[0].filmId) : undefined;
          const isToday = iso === TODAY_ISO;
          const isFuture = iso > TODAY_ISO;

          if (film) {
            return (
              <Link
                key={iso}
                to={`/app/film/${film.id}`}
                aria-label={`${format(parseISO(iso), 'MMMM d')}: ${film.title}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-poster ring-1 ring-inset ring-white/10 transition-[transform,box-shadow] duration-300 ease-cinema hover:-translate-y-0.5 hover:shadow-poster-hover sm:rounded-xl">
                
                <img src={film.poster} alt="" className="h-full w-full object-cover transition-transform duration-300 ease-cinema group-hover:scale-105" />
                <span className="absolute left-1.5 top-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-fg backdrop-blur-md">
                  {day}
                </span>
                {dayEntries.length > 1 &&
                <span className="absolute right-1.5 top-1.5 rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-gold-ink">
                    +{dayEntries.length - 1}
                  </span>
                }
                {dayEntries[0].rating != null &&
                <span className="absolute inset-x-1.5 bottom-1.5 hidden justify-center rounded-md bg-black/55 py-1 backdrop-blur-md md:flex">
                    <StarRating value={dayEntries[0].rating} size={9} />
                  </span>
                }
              </Link>);

          }

          return (
            <button
              key={iso}
              type="button"
              disabled={isFuture}
              onClick={() => openLog({ date: iso })}
              aria-label={`Log a film for ${format(parseISO(iso), 'MMMM d')}`}
              className={`group relative aspect-[3/4] rounded-lg bg-white/[0.02] ring-1 ring-inset transition-colors duration-150 hover:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-40 sm:rounded-xl ${
              isToday ? 'ring-gold/60' : 'ring-line'}`
              }>
              
              <span className={`absolute left-2 top-1.5 text-[12px] tabular-nums ${isToday ? 'font-semibold text-gold' : 'text-fg-faint'}`}>
                {day}
              </span>
              <PlusIcon
                size={16}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-fg-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
              
            </button>);

        })}
      </div>
    </section>);

}