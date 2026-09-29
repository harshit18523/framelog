import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DiaryTimeline } from '../components/diary/DiaryTimeline';
import { Poster } from '../components/film/Poster';
import { ProfileFilmsGrid } from '../components/profile/ProfileFilmsGrid';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileLists } from '../components/profile/ProfileLists';
import { ProfileReviews } from '../components/profile/ProfileReviews';
import { ButtonLink } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useLibrary } from '../contexts/LibraryContext';
import { profileLists } from '../data/library';
import { favoriteFilmIds, profileStats } from '../data/users';
import { getFilms } from '../utils/films';
import { useScreenInit } from '../useScreenInit.js';

type ProfileTab = 'films' | 'diary' | 'reviews' | 'lists' | 'watchlist';
const tabIds: ProfileTab[] = ['films', 'diary', 'reviews', 'lists', 'watchlist'];

export function Profile() {
  const [params, setParams] = useSearchParams();
  const { entries, watchlist } = useLibrary();
  const screenInit = useScreenInit() as {profileTab?: ProfileTab;};
  const rawTab = (params.get('tab') ?? screenInit.profileTab ?? null) as ProfileTab | null;
  const tab: ProfileTab = rawTab && tabIds.includes(rawTab) ? rawTab : 'films';

  const setTab = (next: ProfileTab) => setParams(next === 'films' ? {} : { tab: next }, { replace: true });

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-12 lg:py-14">
      <ProfileHeader />

      <section aria-labelledby="favorites-heading" className="mt-16">
        <h2 id="favorites-heading" className="mb-5 text-sm font-medium text-fg-subtle">
          Favourite films
        </h2>
        <ul className="grid max-w-[720px] grid-cols-4 gap-3 sm:gap-5">
          {getFilms(favoriteFilmIds).map((film) =>
          <li key={film.id}>
              <Poster film={film} eager />
            </li>
          )}
        </ul>
      </section>

      <div className="mt-16 border-b border-line">
        <Tabs
          label="Profile sections"
          layoutId="profile-tabs"
          value={tab}
          onChange={setTab}
          items={[
          { id: 'films', label: 'Films', count: profileStats.filmsWatched },
          { id: 'diary', label: 'Diary', count: entries.length },
          { id: 'reviews', label: 'Reviews', count: entries.filter((e) => e.review).length },
          { id: 'lists', label: 'Lists', count: profileLists.length },
          { id: 'watchlist', label: 'Watchlist', count: watchlist.length }]
          } />
        
      </div>

      <div className="mt-10">
        {tab === 'films' && <ProfileFilmsGrid />}
        {tab === 'diary' && <DiaryTimeline entries={entries} compact />}
        {tab === 'reviews' && <ProfileReviews />}
        {tab === 'lists' && <ProfileLists />}
        {tab === 'watchlist' && (
        watchlist.length ?
        <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 md:grid-cols-5 xl:grid-cols-6 xl:gap-x-6">
              {getFilms(watchlist).map((film) =>
          <li key={film.id}>
                  <Poster film={film} />
                </li>
          )}
            </ul> :

        <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
              <p className="text-[15px] font-medium">Nothing saved for later</p>
              <p className="mt-1.5 text-sm text-fg-subtle">Films you want to see will collect here.</p>
              <ButtonLink to="/app/discover" variant="secondary" size="sm" className="mt-5">
                Discover films
              </ButtonLink>
            </div>)
        }
      </div>
    </div>);

}