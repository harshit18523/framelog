import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import { initialDiary } from '../../data/library';
import { appNavigation } from '../../data/navigation';
import { profileStats } from '../../data/users';
import { isNavActive } from '../../utils/navigation';

export function Sidebar() {
  const { pathname, search } = useLocation();
  const { entries } = useLibrary();
  const thisYear = profileStats.thisYear + Math.max(0, entries.length - initialDiary.length);
  const progress = Math.min(100, thisYear / profileStats.yearlyGoal * 100);

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex">
      <nav aria-label="Primary">
        <ul className="space-y-0.5">
          {appNavigation.map((item) => {
            const active = isNavActive(item.id, pathname, search);
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                  active ? 'bg-white/[0.07] text-fg' : 'text-fg-subtle hover:bg-white/[0.04] hover:text-fg'}`
                  }>
                  
                  <Icon size={18} strokeWidth={active ? 2.1 : 1.75} className={active ? 'text-gold' : ''} />
                  {item.label}
                </Link>
              </li>);

          })}
        </ul>
      </nav>

      <div className="mt-auto px-3">
        <div className="flex items-baseline justify-between">
          <p className="text-xs text-fg-subtle">2026 goal</p>
          <p className="text-xs tabular-nums text-fg-muted">
            <span className="font-semibold text-fg">{thisYear}</span> / {profileStats.yearlyGoal}
          </p>
        </div>
        <div
          className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.07]"
          role="progressbar"
          aria-label="Yearly film goal"
          aria-valuenow={thisYear}
          aria-valuemin={0}
          aria-valuemax={profileStats.yearlyGoal}>
          
          <div className="h-full rounded-full bg-gold" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-fg-faint">
          {profileStats.yearlyGoal - thisYear} films to go — about two a week.
        </p>
      </div>
    </aside>);

}