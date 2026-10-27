import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { DiaryTimeline } from '../components/diary/DiaryTimeline';
import { Poster } from '../components/film/Poster';
import { ProfileFilmsGrid } from '../components/profile/ProfileFilmsGrid';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { EditProfileDialog } from '../components/profile/EditProfileDialog';
import { ProfileLists } from '../components/profile/ProfileLists';
import { ProfileReviews } from '../components/profile/ProfileReviews';
import { ButtonLink } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { useAuth } from '../contexts/AuthContext';
import { useLibrary } from '../contexts/LibraryContext';
import { getFilms } from '../utils/films';
import { useScreenInit } from '../useScreenInit.js';
import {
  getUserProfileApi,
  followUserApi,
  unfollowUserApi,
  UserProfileData,
} from '../api/users.api';
import { getOrCreateConversationApi } from '../api/chats.api';
import apiClient from '../api/client';
import type { DiaryEntry } from '../types/film';

type ProfileTab = 'films' | 'diary' | 'reviews' | 'lists' | 'watchlist';
const tabIds: ProfileTab[] = ['films', 'diary', 'reviews', 'lists', 'watchlist'];

export function Profile() {
  const { id: paramId } = useParams<{ id?: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { entries: myEntries, watched: myWatched, watchlist: myWatchlist, liked: myLiked } = useLibrary();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetEntries, setTargetEntries] = useState<DiaryEntry[]>([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const uniqueFilmIds = React.useMemo(() => {
    const ids = new Set<string>();
    myEntries.forEach((e) => ids.add(e.filmId));
    myWatched.forEach((id) => ids.add(id));
    return ids;
  }, [myEntries, myWatched]);

  const screenInit = useScreenInit() as { profileTab?: ProfileTab };
  const rawTab = (params.get('tab') ?? screenInit.profileTab ?? null) as ProfileTab | null;
  const tab: ProfileTab = rawTab && tabIds.includes(rawTab) ? rawTab : 'films';

  const setTab = (next: ProfileTab) => setParams(next === 'films' ? {} : { tab: next }, { replace: true });

  const isViewingOtherUser = Boolean(
    paramId &&
      authUser &&
      paramId !== authUser.id &&
      paramId !== authUser._id &&
      paramId.toLowerCase() !== authUser.username.toLowerCase()
  );

  // Load user profile and their entries
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadProfile = async () => {
      try {
        const identifier = paramId || authUser?.id || authUser?._id || 'me';
        if (identifier === 'me' && !authUser) return;

        const profileData = await getUserProfileApi(identifier);
        if (!isMounted) return;
        setProfile(profileData);

        // If viewing other user, also fetch their public diary entries
        if (paramId && profileData.id !== authUser?.id) {
          try {
            const res = await apiClient.get<{ success: boolean; data: DiaryEntry[] }>('/diary', {
              params: { userId: profileData.id },
            });
            if (isMounted && res.data.data) {
              setTargetEntries(res.data.data);
            }
          } catch (e) {
            console.warn('[Profile] Could not fetch other user diary:', e);
          }
        }
      } catch (err: any) {
        console.error('[Profile] Error loading profile:', err);
        toast.error(err.message || 'Could not load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [paramId, authUser]);

  const handleFollowToggle = useCallback(async () => {
    if (!profile) return;
    setFollowLoading(true);
    const prevFollowing = profile.isFollowing;
    const prevCount = profile.followersCount;

    // Optimistic update
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: !prevFollowing,
            followersCount: prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1,
          }
        : null
    );

    try {
      if (prevFollowing) {
        const res = await unfollowUserApi(profile.id);
        setProfile((prev) => (prev ? { ...prev, isFollowing: false, followersCount: res.followersCount } : null));
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        const res = await followUserApi(profile.id);
        setProfile((prev) => (prev ? { ...prev, isFollowing: true, followersCount: res.followersCount } : null));
        toast.success(`Following @${profile.username}`);
      }
    } catch (err: any) {
      // Revert optimistic update
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: prevFollowing,
              followersCount: prevCount,
            }
          : null
      );
      toast.error(err.message || 'Follow action failed');
    } finally {
      setFollowLoading(false);
    }
  }, [profile]);

  const handleMessage = useCallback(async () => {
    if (!profile) return;
    try {
      const conv = await getOrCreateConversationApi(profile.id);
      navigate(`/app/chats?id=${conv.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not open conversation');
    }
  }, [profile, navigate]);

  const displayEntries = isViewingOtherUser ? targetEntries : myEntries;
  const favoriteFilms = isViewingOtherUser ? [] : getFilms(myLiked).slice(0, 4);

  if (loading && !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2Icon size={24} className="animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-12 lg:py-14">
      <ProfileHeader
        profile={profile}
        isSelf={!isViewingOtherUser}
        isFollowing={profile?.isFollowing || false}
        followersCount={profile?.followersCount || 0}
        followingCount={profile?.followingCount || 0}
        onFollowToggle={handleFollowToggle}
        followLoading={followLoading}
        onMessage={handleMessage}
        entriesCount={isViewingOtherUser ? new Set(displayEntries.map((e) => e.filmId)).size : uniqueFilmIds.size}
        onEditProfile={() => setEditOpen(true)}
      />

      {favoriteFilms.length > 0 && !isViewingOtherUser && (
        <section aria-labelledby="favorites-heading" className="mt-16">
          <h2 id="favorites-heading" className="mb-5 text-sm font-medium text-fg-subtle">
            Favourite films
          </h2>
          <ul className="grid max-w-[720px] grid-cols-4 gap-3 sm:gap-5">
            {favoriteFilms.map((film) => (
              <li key={film.id}>
                <Poster film={film} eager />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16 border-b border-line">
        <Tabs
          label="Profile sections"
          layoutId="profile-tabs"
          value={tab}
          onChange={setTab}
          items={[
            {
              id: 'films',
              label: 'Films',
              count: isViewingOtherUser
                ? new Set(displayEntries.map((e) => e.filmId)).size
                : uniqueFilmIds.size,
            },
            { id: 'diary', label: 'Diary', count: displayEntries.length },
            { id: 'reviews', label: 'Reviews', count: displayEntries.filter((e) => e.review).length },
            { id: 'lists', label: 'Lists', count: 0 },
            { id: 'watchlist', label: 'Watchlist', count: isViewingOtherUser ? 0 : myWatchlist.length },
          ]}
        />
      </div>

      <div className="mt-10">
        {tab === 'films' && (
          isViewingOtherUser ? (
            displayEntries.length > 0 ? (
              <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 md:grid-cols-5 xl:grid-cols-6 xl:gap-x-6">
                {Array.from(new Map(displayEntries.map((e) => [e.filmId, e])).values()).map((e) => {
                  const film = (e.film as any) || { id: e.filmId, title: 'Film' };
                  return (
                    <li key={e.filmId}>
                      <Poster film={film} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center text-sm text-fg-subtle">
                No films logged by @{profile?.username || 'this user'} yet.
              </div>
            )
          ) : (
            <ProfileFilmsGrid />
          )
        )}
        {tab === 'diary' && <DiaryTimeline entries={displayEntries} compact />}
        {tab === 'reviews' && (
          isViewingOtherUser ? (
            <div className="space-y-4">
              {displayEntries.filter((e) => e.review).map((e) => (
                <div key={e.id} className="rounded-2xl border border-line bg-surface/50 p-5">
                  <p className="font-semibold text-fg">{(e.film as any)?.title || 'Film'}</p>
                  <p className="mt-2 text-sm text-fg-muted">{e.review}</p>
                  <p className="mt-3 text-xs text-fg-subtle">{e.date}</p>
                </div>
              ))}
            </div>
          ) : (
            <ProfileReviews />
          )
        )}
        {tab === 'lists' && <ProfileLists />}
        {tab === 'watchlist' && (
          myWatchlist.length ? (
            <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 md:grid-cols-5 xl:grid-cols-6 xl:gap-x-6">
              {getFilms(myWatchlist).map((film) => (
                <li key={film.id}>
                  <Poster film={film} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
              <p className="text-[15px] font-medium">Nothing saved for later</p>
              <p className="mt-1.5 text-sm text-fg-subtle">Films you want to see will collect here.</p>
              <ButtonLink to="/app/discover" variant="secondary" size="sm" className="mt-5">
                Discover films
              </ButtonLink>
            </div>
          )
        )}
      </div>

      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />
    </div>
  );
}

export default Profile;
