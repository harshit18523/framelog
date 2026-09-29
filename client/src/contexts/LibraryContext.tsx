import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialDiary, initialLiked, initialWatchlist } from '../data/library';
import type { DiaryEntry } from '../types/film';
import { TODAY_ISO } from '../utils/dates';
import { useScreenInit } from '../useScreenInit.js';

type LogDialogState = {
  open: boolean;
  filmId?: string;
  date?: string;
};

type LibraryContextValue = {
  entries: DiaryEntry[];
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
  openLog: (options?: {filmId?: string;date?: string;}) => void;
  closeLog: () => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: {children: React.ReactNode;}) {
  const [entries, setEntries] = useState<DiaryEntry[]>(initialDiary);
  const [watchlist, setWatchlist] = useState<string[]>(initialWatchlist);
  const [liked, setLiked] = useState<string[]>(initialLiked);
  const screenInit = useScreenInit() as {logOpen?: boolean;logFilmId?: string;};
  const [logDialog, setLogDialog] = useState<LogDialogState>({
    open: Boolean(screenInit.logOpen),
    filmId: screenInit.logFilmId
  });

  const addEntry = useCallback((entry: Omit<DiaryEntry, 'id'>) => {
    setEntries((prev) =>
    [{ ...entry, id: `d-${Date.now()}` }, ...prev].sort((a, b) => b.date.localeCompare(a.date))
    );
    setWatchlist((prev) => prev.filter((id) => id !== entry.filmId));
    if (entry.liked) setLiked((prev) => prev.includes(entry.filmId) ? prev : [...prev, entry.filmId]);
  }, []);

  const toggleWatched = useCallback((filmId: string) => {
    setEntries((prev) => {
      if (prev.some((e) => e.filmId === filmId)) return prev.filter((e) => e.filmId !== filmId);
      return [{ id: `d-${Date.now()}`, filmId, date: TODAY_ISO, liked: false, rewatch: false }, ...prev];
    });
    setWatchlist((prev) => prev.filter((id) => id !== filmId));
  }, []);

  const toggleWatchlist = useCallback((filmId: string) => {
    setWatchlist((prev) => prev.includes(filmId) ? prev.filter((id) => id !== filmId) : [...prev, filmId]);
  }, []);

  const toggleLiked = useCallback((filmId: string) => {
    setLiked((prev) => prev.includes(filmId) ? prev.filter((id) => id !== filmId) : [...prev, filmId]);
  }, []);

  const setRating = useCallback((filmId: string, rating: number | undefined) => {
    setEntries((prev) => {
      const index = prev.findIndex((e) => e.filmId === filmId);
      if (index === -1) {
        return [{ id: `d-${Date.now()}`, filmId, date: TODAY_ISO, rating, liked: false, rewatch: false }, ...prev];
      }
      const next = [...prev];
      next[index] = { ...next[index], rating };
      return next;
    });
  }, []);

  const openLog = useCallback((options?: {filmId?: string;date?: string;}) => {
    setLogDialog({ open: true, filmId: options?.filmId, date: options?.date });
  }, []);

  const closeLog = useCallback(() => setLogDialog((prev) => ({ ...prev, open: false })), []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      entries,
      watchlist,
      liked,
      logDialog,
      isWatched: (filmId) => entries.some((e) => e.filmId === filmId),
      ratingFor: (filmId) => entries.find((e) => e.filmId === filmId && e.rating != null)?.rating,
      addEntry,
      toggleWatched,
      toggleWatchlist,
      toggleLiked,
      setRating,
      openLog,
      closeLog
    }),
    [entries, watchlist, liked, logDialog, addEntry, toggleWatched, toggleWatchlist, toggleLiked, setRating, openLog, closeLog]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside LibraryProvider');
  return context;
}