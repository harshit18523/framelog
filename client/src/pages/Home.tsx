import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { ActivityCard } from '../components/feed/ActivityCard';
import { HomeRail } from '../components/feed/HomeRail';
import { Avatar } from '../components/ui/Avatar';
import { Tabs } from '../components/ui/Tabs';
import { useLibrary } from '../contexts/LibraryContext';
import { activity } from '../data/activity';
import { currentUser } from '../data/users';
import { useScreenInit } from '../useScreenInit.js';

type FeedFilter = 'all' | 'reviews';

export function Home() {
  const { openLog } = useLibrary();
  const screenInit = useScreenInit() as {feedFilter?: FeedFilter;};
  const [filter, setFilter] = useState<FeedFilter>(screenInit.feedFilter ?? 'all');
  const items = filter === 'all' ? activity : activity.filter((a) => a.kind === 'review');

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      <div className="grid gap-16 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="home-title" className="min-w-0 max-w-[720px]">
          <p className="text-sm text-fg-subtle">Tuesday, September 29</p>
          <h1 id="home-title" className="mt-1.5 text-[32px] font-semibold leading-tight tracking-display sm:text-[42px]">
            Good evening, Maya
          </h1>

          <button
            type="button"
            onClick={() => openLog()}
            className="group mt-8 flex w-full items-center gap-4 rounded-2xl bg-surface p-3 pl-3.5 text-left ring-1 ring-inset ring-line transition-[background-color,box-shadow] duration-200 ease-cinema hover:bg-surface-raised hover:ring-line-strong focus-visible:outline-none focus-visible:ring-gold/50"
          >
            <Avatar user={currentUser} size="md" />
            <span className="flex-1 text-[15px] text-fg-subtle transition-colors group-hover:text-fg-muted">
              What did you watch tonight?
            </span>
            <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/[0.06] px-4 text-[13px] font-medium text-fg ring-1 ring-inset ring-line transition-colors group-hover:bg-gold group-hover:text-gold-ink group-hover:ring-transparent">
              <PlusIcon size={15} /> Log
            </span>
          </button>

          <div className="mt-12 border-b border-line">
            <Tabs<FeedFilter>
              label="Feed filter"
              layoutId="feed-tabs"
              value={filter}
              onChange={setFilter}
              items={[
                { id: 'all', label: 'Friends’ activity' },
                { id: 'reviews', label: 'Reviews' },
              ]}
            />
          </div>

          <ol className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.id}>
                <ActivityCard activity={item} />
              </li>
            ))}
          </ol>

          <p className="border-t border-line pt-8 text-center text-sm text-fg-faint">
            You’re all caught up. Follow more people to fill your feed.
          </p>
        </section>

        <HomeRail />
      </div>
    </div>
  );
}