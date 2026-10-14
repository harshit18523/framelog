import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { DiaryEntry } from '../types/film';
import { TODAY_ISO } from '../utils/dates';
import { cacheFilm, getFilm } from '../utils/films';
import { useScreenInit } from '../useScreenInit.js';
import { useAuth } from './AuthContext';
import {
  getDiaryEntriesApi,
  createDiaryEntryApi,
  updateDiaryEntryApi,
  deleteDiaryEntryApi,
  getWatchedApi,
  addWatchedApi,
  removeWatchedApi,
  getWatchlistApi,
  addToWatchlistApi,
  removeFromWatchlistApi,
  getLikesApi,
  likeFilmApi,
  unlikeFilmApi,
} from '../api/library.api';

type LogDialogState = {
  open: boolean;
  filmId?: string;
  date?: string;
};

type LibraryContextValue = {
  entries: DiaryEntry[];
  watched: string[];
  watchedItems: Array<{ id: string; filmId: string; film?: Partial<Film>; createdAt?: string }>;
  watchlist: string[];
  liked: string[];
  logDialog: LogDialogState;
  isWatched: (filmId: string) => boolean;
  ratingFor: (filmId: string) => number | undefined;
  addEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  toggleWatched: (filmId: string) => void;
  toggleWatchlist: (filmId: string) => void;
  toggleLiked: (filmId: string) => void;
  setRating: (filmId: string, rating: number | undefined) => void;
  openLog: (options?: { filmId?: string; date?: string }) => void;
  closeLog: () => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const screenInit = useScreenInit() as { logOpen?: boolean; logFilmId?: string };

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [watched, setWatched] = useState<string[]>([]);
  const [watchedItems, setWatchedItems] = useState<
    Array<{ id: string; filmId: string; film?: Partial<Film>; createdAt?: string }>
  >([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [liked, setLiked] = useState<string[]>([]);

  const [logDialog, setLogDialog] = useState<LogDialogState>({
    open: Boolean(screenInit.logOpen),
    filmId: screenInit.logFilmId,
  });

  // Fetch library data from MongoDB when user logs in
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setWatched([]);
      setWatchedItems([]);
      setWatchlist([]);
      setLiked([]);
      return;
    }

    let isMounted = true;

    const fetchLibrary = async () => {
      try {
        const [diaryEntries, watchedData, watchlistData, likesData] = await Promise.all([
          getDiaryEntriesApi().catch((err) => {
            console.error('[Library] Failed to load diary:', err);
            return [] as DiaryEntry[];
          }),
          getWatchedApi().catch((err) => {
            console.error('[Library] Failed to load watched:', err);
            return { items: [], filmIds: [] };
          }),
          getWatchlistApi().catch((err) => {
            console.error('[Library] Failed to load watchlist:', err);
            return { items: [], filmIds: [] };
          }),
          getLikesApi().catch((err) => {
            console.error('[Library] Failed to load likes:', err);
            return { filmIds: [] };
          }),
        ]);

        if (!isMounted) return;

        // Cache any embedded film data from backend
        diaryEntries.forEach((entry) => {
          if (entry.film) cacheFilm(entry.film);
        });
        watchedData.items?.forEach((item) => {
          if (item.film) cacheFilm(item.film as any);
        });
        watchlistData.items?.forEach((item) => {
          if (item.film) cacheFilm(item.film as any);
        });

        setEntries(diaryEntries);
        setWatched(watchedData.filmIds || []);
        setWatchedItems(watchedData.items || []);
        setWatchlist(watchlistData.filmIds || []);
        setLiked(likesData.filmIds || []);
      } catch (err) {
        console.error('[Library] Failed to fetch user library:', err);
      }
    };

    fetchLibrary();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const addEntry = useCallback(
    async (entryData: Omit<DiaryEntry, 'id'>) => {
      const film = getFilm(entryData.filmId);
      // Optimistic temporary entry
      const tempId = `temp-${Date.now()}`;
      const optimisticEntry: DiaryEntry = { ...entryData, id: tempId, film };

      setEntries((prev) => [optimisticEntry, ...prev.filter((e) => e.filmId !== entryData.filmId)]);
      setWatched((prev) => (prev.includes(entryData.filmId) ? prev : [...prev, entryData.filmId]));
      setWatchlist((prev) => prev.filter((id) => id !== entryData.filmId));
      if (entryData.liked) {
        setLiked((prev) => (prev.includes(entryData.filmId) ? prev : [...prev, entryData.filmId]));
      }

      try {
        const created = await createDiaryEntryApi({
          ...entryData,
          film,
        });

        setEntries((prev) =>
          prev.map((e) => (e.id === tempId ? { ...created, film: created.film || film } : e))
        );
      } catch (err) {
        console.error('[Library] Failed to create diary entry on server:', err);
      }
    },
    []
  );

  const toggleWatched = useCallback(
    async (filmId: string) => {
      const isAlreadyWatched = watched.includes(filmId);
      const film = getFilm(filmId);

      if (isAlreadyWatched) {
        // Optimistically remove from watched
        setWatched((prev) => prev.filter((id) => id !== filmId));
        setWatchedItems((prev) => prev.filter((item) => item.filmId !== filmId));
        try {
          await removeWatchedApi(filmId);
        } catch (err) {
          console.error('[Library] Failed to remove from watched:', err);
          // Rollback
          setWatched((prev) => [...prev, filmId]);
          if (film) {
            setWatchedItems((prev) => [...prev, { id: `watched-${filmId}`, filmId, film }]);
          }
        }
      } else {
        // Optimistically add to watched
        setWatched((prev) => [...prev, filmId]);
        setWatchedItems((prev) => [
          { id: `watched-${Date.now()}`, filmId, film, createdAt: new Date().toISOString() },
          ...prev.filter((i) => i.filmId !== filmId),
        ]);
        // Also remove from watchlist if it was there
        setWatchlist((prev) => prev.filter((id) => id !== filmId));

        try {
          await addWatchedApi(filmId, film);
        } catch (err) {
          console.error('[Library] Failed to mark as watched:', err);
          // Rollback
          setWatched((prev) => prev.filter((id) => id !== filmId));
          setWatchedItems((prev) => prev.filter((item) => item.filmId !== filmId));
        }
      }
    },
    [watched]
  );

  const toggleWatchlist = useCallback(
    async (filmId: string) => {
      const inWatchlist = watchlist.includes(filmId);
      const film = getFilm(filmId);

      if (inWatchlist) {
        setWatchlist((prev) => prev.filter((id) => id !== filmId));
        try {
          await removeFromWatchlistApi(filmId);
        } catch (err) {
          console.error('[Library] Failed to remove from watchlist:', err);
          setWatchlist((prev) => [...prev, filmId]);
        }
      } else {
        setWatchlist((prev) => [...prev, filmId]);
        try {
          await addToWatchlistApi(filmId, film);
        } catch (err) {
          console.error('[Library] Failed to add to watchlist:', err);
          setWatchlist((prev) => prev.filter((id) => id !== filmId));
        }
      }
    },
    [watchlist]
  );

  const toggleLiked = useCallback(
    async (filmId: string) => {
      const isLiked = liked.includes(filmId);

      if (isLiked) {
        setLiked((prev) => prev.filter((id) => id !== filmId));
        try {
          await unlikeFilmApi(filmId);
        } catch (err) {
          console.error('[Library] Failed to unlike film:', err);
          setLiked((prev) => [...prev, filmId]);
        }
      } else {
        setLiked((prev) => [...prev, filmId]);
        try {
          await likeFilmApi(filmId);
        } catch (err) {
          console.error('[Library] Failed to like film:', err);
          setLiked((prev) => prev.filter((id) => id !== filmId));
        }
      }
    },
    [liked]
  );

  const setRating = useCallback(
    async (filmId: string, rating: number | undefined) => {
      const existing = entries.find((e) => e.filmId === filmId);

      if (existing) {
        setEntries((prev) =>
          prev.map((e) => (e.id === existing.id ? { ...e, rating } : e))
        );
        try {
          await updateDiaryEntryApi(existing.id, { rating });
        } catch (err) {
          console.error('[Library] Failed to update rating on server:', err);
          setEntries((prev) =>
            prev.map((e) => (e.id === existing.id ? existing : e))
          );
        }
      } else {
        addEntry({
          filmId,
          date: TODAY_ISO,
          rating,
          liked: false,
          rewatch: false,
        });
      }
    },
    [entries, addEntry]
  );

  const openLog = useCallback((options?: { filmId?: string; date?: string }) => {
    setLogDialog({ open: true, filmId: options?.filmId, date: options?.date });
  }, []);

  const closeLog = useCallback(() => setLogDialog((prev) => ({ ...prev, open: false })), []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      entries,
      watched,
      watchedItems,
      watchlist,
      liked,
      logDialog,
      isWatched: (filmId) => watched.includes(filmId) || entries.some((e) => e.filmId === filmId),
      ratingFor: (filmId) => entries.find((e) => e.filmId === filmId && e.rating != null)?.rating,
      addEntry,
      toggleWatched,
      toggleWatchlist,
      toggleLiked,
      setRating,
      openLog,
      closeLog,
    }),
    [
      entries,
      watched,
      watchedItems,
      watchlist,
      liked,
      logDialog,
      addEntry,
      toggleWatched,
      toggleWatchlist,
      toggleLiked,
      setRating,
      openLog,
      closeLog,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside LibraryProvider');
  return context;
}

export default LibraryContext;
