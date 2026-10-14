import React, { useEffect, useMemo, useState } from 'react';
import { Loader2Icon, PlusIcon, UsersIcon } from 'lucide-react';
import { ActivityCard } from '../components/feed/ActivityCard';
import { HomeRail } from '../components/feed/HomeRail';
import { Avatar } from '../components/ui/Avatar';
import { ButtonLink } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useLibrary } from '../contexts/LibraryContext';
import { useAuth } from '../contexts/AuthContext';
import { getFeedApi } from '../api/users.api';
import type { Activity } from '../types/social';
import { useScreenInit } from '../useScreenInit.js';

type FeedFilter = 'all' | 'reviews';

export function Home() {
  const { openLog } = useLibrary();
  const { user } = useAuth();
  const screenInit = useScreenInit() as { feedFilter?: FeedFilter };
  const [filter, setFilter] = useState<FeedFilter>(screenInit.feedFilter ?? 'all');

  const [feedItems, setFeedItems] = useState<Activity[]>([]);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadFeed = async () => {
      try {
        setLoading(true);
        const data = await getFeedApi();
        if (!isMounted) return;
        setFeedItems(data.items || []);
        setFollowingCount(data.followingCount ?? 0);
      } catch (err) {
        console.error('[Home] Failed to load activity feed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(() => {
    if (filter === 'reviews') {
      return feedItems.filter((a) => a.kind === 'review' || Boolean(a.text));
    }
    return feedItems;
  }, [feedItems, filter]);

  const activeUser = user
    ? {
        id: user.id || (user as any)._id,
        name: user.name,
        handle: user.username,
        initials: user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        tone: 'hsl(45, 100%, 51%)',
        avatar: user.avatar,
      }
    : {
        id: 'me',
        name: 'Cinephile',
        handle: 'cinephile',
        initials: 'C',
        tone: 'hsl(45, 100%, 51%)',
        avatar: undefined,
      };

  const firstName = activeUser.name.split(' ')[0] || 'Cinephile';

  // Format today's date in local readable format
  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      <div className="grid gap-16 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="home-title" className="min-w-0 max-w-[720px]">
          <p className="text-sm text-fg-subtle">{todayDateString}</p>
          <h1 id="home-title" className="mt-1.5 text-[32px] font-semibold leading-tight tracking-display sm:text-[42px]">
            Good evening, {firstName}
          </h1>

          <button
            type="button"
            onClick={() => openLog()}
            className="group mt-8 flex w-full items-center gap-4 rounded-2xl bg-surface p-3 pl-3.5 text-left ring-1 ring-inset ring-line transition-[background-color,box-shadow] duration-200 ease-cinema hover:bg-surface-raised hover:ring-line-strong focus-visible:outline-none focus-visible:ring-gold/50"
          >
            <Avatar user={activeUser as any} size="md" />
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

          {loading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2Icon size={24} className="animate-spin text-gold" />
            </div>
          ) : followingCount === 0 ? (
            <div className="my-10 rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
              <UsersIcon size={32} className="mx-auto mb-3 text-fg-subtle" />
              <p className="text-[17px] font-semibold text-fg">Follow people to see their activity</p>
              <p className="mt-1.5 text-sm text-fg-subtle">
                Connect with friends and discover what films they are watching and reviewing.
              </p>
              <ButtonLink to="/app/discover" variant="secondary" size="sm" className="mt-5">
                Find people to follow
              </ButtonLink>
            </div>
          ) : items.length === 0 ? (
            <div className="my-10 rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
              <p className="text-[16px] font-medium text-fg">
                {filter === 'reviews' ? 'No reviews from friends yet' : 'No activity yet'}
              </p>
              <p className="mt-1.5 text-sm text-fg-subtle">
                People you follow haven’t logged any {filter === 'reviews' ? 'reviews' : 'films'} recently.
              </p>
              <ButtonLink to="/app/discover" variant="secondary" size="sm" className="mt-5">
                Discover more people
              </ButtonLink>
            </div>
          ) : (
            <>
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
            </>
          )}
        </section>

        <HomeRail />
      </div>
    </div>
  );
}

export default Home;
