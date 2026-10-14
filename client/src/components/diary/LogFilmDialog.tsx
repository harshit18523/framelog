import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon, RepeatIcon, SearchIcon, XIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary } from '../../contexts/LibraryContext';
import { getTodayIso, TODAY_ISO } from '../../utils/dates';
import { cacheFilm, cacheFilms, getFilm } from '../../utils/films';
import { Poster } from '../film/Poster';
import { Button } from '../ui/Button';
import { RatingInput } from '../ui/RatingInput';
import { getPopularFilmsApi, searchFilmsApi } from '../../api/films.api';
import type { Film } from '../../types/film';

const ease = [0.23, 1, 0.32, 1] as const;
const MAX_REVIEW = 1200;

export function LogFilmDialog() {
  const { logDialog, closeLog, addEntry } = useLibrary();
  const [filmId, setFilmId] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(getTodayIso);
  const [rating, setRating] = useState<number | undefined>();
  const [review, setReview] = useState('');
  const [liked, setLiked] = useState(false);
  const [rewatch, setRewatch] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchResults, setSearchResults] = useState<Film[]>([]);
  const [popularSuggestions, setPopularSuggestions] = useState<Film[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!logDialog.open) return;
    setFilmId(logDialog.filmId);
    setDate(logDialog.date ?? getTodayIso());
    setQuery('');
    setRating(undefined);
    setReview('');
    setLiked(false);
    setRewatch(false);
    setSaving(false);

    // Fetch popular films to show as initial suggestions
    getPopularFilmsApi()
      .then((res) => {
        if (res.results) {
          cacheFilms(res.results);
          setPopularSuggestions(res.results.slice(0, 8));
        }
      })
      .catch(() => {});
  }, [logDialog.open, logDialog.filmId, logDialog.date]);

  useEffect(() => {
    if (!logDialog.open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLog();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [logDialog.open, closeLog]);

  // Real-time search with debounce (350ms)
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    let isMounted = true;
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchFilmsApi(q);
        if (!isMounted) return;
        cacheFilms(res.results);
        setSearchResults(res.results.slice(0, 8));
      } catch (err) {
        console.error('[LogFilmDialog] Search error:', err);
        if (isMounted) setSearchResults([]);
      } finally {
        if (isMounted) setSearching(false);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const film = getFilm(filmId);

  const handleSelectFilm = (selected: Film) => {
    cacheFilm(selected);
    setFilmId(selected.id);
  };

  const handleSave = () => {
    if (!film) return;
    setSaving(true);
    window.setTimeout(() => {
      addEntry({
        filmId: film.id,
        date,
        rating,
        review: review.trim() || undefined,
        liked,
        rewatch,
        film,
      });
      toast.success(`${film.title} added to your diary`);
      closeLog();
    }, 300);
  };

  const displayedList = query.trim() ? searchResults : popularSuggestions;

  return (
    <AnimatePresence>
      {logDialog.open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            onClick={closeLog}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="log-dialog-title"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.24, ease }}
            className="relative w-full max-w-[600px] overflow-hidden rounded-3xl bg-surface-raised/90 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 id="log-dialog-title" className="text-[15px] font-semibold">
                {film ? 'Log a film' : 'What did you watch?'}
              </h2>
              <button
                type="button"
                onClick={closeLog}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-white/[0.06] hover:text-fg"
              >
                <XIcon size={16} />
              </button>
            </div>

            {!film ? (
              <div className="p-3">
                <div className="relative px-3 pb-2 pt-2">
                  <SearchIcon
                    size={16}
                    className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-fg-subtle"
                  />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search TMDB for any film in real-time…"
                    aria-label="Search for a film"
                    className="h-11 w-full rounded-xl bg-white/[0.05] pl-10 pr-10 text-sm ring-1 ring-inset ring-line placeholder:text-fg-subtle focus:outline-none focus:ring-gold/50"
                  />
                  {searching && (
                    <Loader2Icon
                      size={16}
                      className="absolute right-7 top-1/2 -translate-y-1/2 animate-spin text-gold"
                    />
                  )}
                </div>

                {!query.trim() && popularSuggestions.length > 0 && (
                  <p className="px-4 py-1 text-xs font-medium text-fg-subtle">Popular suggestions</p>
                )}

                <ul className="max-h-[380px] overflow-y-auto p-1">
                  {displayedList.map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectFilm(f)}
                        className="flex w-full items-center gap-4 rounded-xl p-2 text-left transition-colors duration-150 hover:bg-white/[0.05] focus-visible:bg-white/[0.05] focus-visible:outline-none"
                      >
                        {f.poster ? (
                          <img
                            src={f.poster}
                            alt=""
                            className="h-14 w-[38px] rounded-md object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="grid h-14 w-[38px] place-items-center rounded-md bg-white/[0.06] ring-1 ring-white/10">
                            <span className="text-[10px] text-fg-faint">No Art</span>
                          </div>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-fg">{f.title}</span>
                          <span className="block text-xs text-fg-subtle">
                            {f.year || '—'} {f.director !== 'Various' ? `· ${f.director}` : ''}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                  {query.trim() && displayedList.length === 0 && !searching && (
                    <li className="px-4 py-10 text-center text-sm text-fg-subtle">
                      No films match “{query}”.
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <div className="grid gap-6 p-6 sm:grid-cols-[132px_minmax(0,1fr)]">
                <div className="hidden sm:block">
                  <Poster film={film} linked={false} />
                  {!logDialog.filmId && (
                    <button
                      type="button"
                      onClick={() => setFilmId(undefined)}
                      className="mt-3 w-full text-center text-xs text-fg-subtle transition-colors hover:text-fg"
                    >
                      Change film
                    </button>
                  )}
                </div>
                <div className="min-w-0 space-y-5">
                  <div>
                    <p className="text-xl font-semibold tracking-title">
                      {film.title} <span className="font-normal text-fg-subtle">{film.year}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-fg-subtle">Directed by {film.director}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs text-fg-subtle">Watched on</span>
                      <input
                        type="date"
                        value={date}
                        max={getTodayIso()}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-10 w-full rounded-xl bg-white/[0.05] px-3 text-sm text-fg ring-1 ring-inset ring-line focus:outline-none focus:ring-gold/50"
                      />
                    </label>
                    <div className="flex items-end gap-2">
                      <ToggleChip active={liked} onClick={() => setLiked((v) => !v)} label="Like">
                        <HeartIcon size={15} fill={liked ? 'currentColor' : 'none'} />
                      </ToggleChip>
                      <ToggleChip active={rewatch} onClick={() => setRewatch((v) => !v)} label="Rewatch">
                        <RepeatIcon size={15} />
                      </ToggleChip>
                    </div>
                  </div>

                  <div>
                    <span className="mb-2 block text-xs text-fg-subtle">Rating</span>
                    <RatingInput value={rating} onChange={setRating} />
                  </div>

                  <label className="block">
                    <span className="mb-1.5 flex justify-between text-xs text-fg-subtle">
                      Review{' '}
                      <span className="tabular-nums text-fg-faint">
                        {review.length > 0 && `${review.length} / ${MAX_REVIEW}`}
                      </span>
                    </span>
                    <textarea
                      value={review}
                      maxLength={MAX_REVIEW}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                      placeholder="What stayed with you? (optional)"
                      className="w-full resize-none rounded-xl bg-white/[0.05] px-3.5 py-3 text-sm leading-relaxed text-fg ring-1 ring-inset ring-line placeholder:text-fg-faint focus:outline-none focus:ring-gold/50"
                    />
                  </label>
                </div>
              </div>
            )}

            {film && (
              <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
                <Button variant="ghost" onClick={closeLog}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="min-w-[132px]">
                  {saving ? 'Saving…' : 'Save to diary'}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

type ToggleChipProps = {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
};

function ToggleChip({ active, onClick, label, children }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-medium ring-1 ring-inset transition-colors duration-150 ${
        active
          ? 'bg-gold/[0.14] text-gold ring-gold/40'
          : 'bg-white/[0.05] text-fg-muted ring-line hover:bg-white/[0.08] hover:text-fg'
      }`}
    >
      {children}
      {label}
    </button>
  );
}

export default LogFilmDialog;
