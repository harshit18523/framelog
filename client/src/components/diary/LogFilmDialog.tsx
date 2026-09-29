import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon, RepeatIcon, SearchIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary } from '../../contexts/LibraryContext';
import { films } from '../../data/films';
import { TODAY_ISO } from '../../utils/dates';
import { getFilm } from '../../utils/films';
import { Poster } from '../film/Poster';
import { Button } from '../ui/Button';
import { RatingInput } from '../ui/RatingInput';

const ease = [0.23, 1, 0.32, 1] as const;
const MAX_REVIEW = 1200;

export function LogFilmDialog() {
  const { logDialog, closeLog, addEntry } = useLibrary();
  const [filmId, setFilmId] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(TODAY_ISO);
  const [rating, setRating] = useState<number | undefined>();
  const [review, setReview] = useState('');
  const [liked, setLiked] = useState(false);
  const [rewatch, setRewatch] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!logDialog.open) return;
    setFilmId(logDialog.filmId);
    setDate(logDialog.date ?? TODAY_ISO);
    setQuery('');
    setRating(undefined);
    setReview('');
    setLiked(false);
    setRewatch(false);
    setSaving(false);
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

  const film = getFilm(filmId);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return films.filter((f) => !q || `${f.title} ${f.director} ${f.year}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const handleSave = () => {
    if (!film) return;
    setSaving(true);
    window.setTimeout(() => {
      addEntry({ filmId: film.id, date, rating, review: review.trim() || undefined, liked, rewatch });
      toast.success(`${film.title} added to your diary`);
      closeLog();
    }, 450);
  };

  return (
    <AnimatePresence>
      {logDialog.open &&
      <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease }}
          onClick={closeLog}
          aria-hidden />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-dialog-title"
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.24, ease }}
          className="relative w-full max-w-[600px] overflow-hidden rounded-3xl bg-surface-raised/90 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl">
          
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 id="log-dialog-title" className="text-[15px] font-semibold">
                {film ? 'Log a film' : 'What did you watch?'}
              </h2>
              <button
              type="button"
              onClick={closeLog}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-white/[0.06] hover:text-fg">
              
                <XIcon size={16} />
              </button>
            </div>

            {!film ?
          <div className="p-3">
                <div className="relative px-3 pb-2 pt-2">
                  <SearchIcon size={16} className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-fg-subtle" />
                  <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a film…"
                aria-label="Search for a film"
                className="h-11 w-full rounded-xl bg-white/[0.05] pl-10 pr-4 text-sm ring-1 ring-inset ring-line placeholder:text-fg-subtle focus:outline-none focus:ring-gold/50" />
              
                </div>
                <ul className="max-h-[380px] overflow-y-auto p-1">
                  {results.map((f) =>
              <li key={f.id}>
                      <button
                  type="button"
                  onClick={() => setFilmId(f.id)}
                  className="flex w-full items-center gap-4 rounded-xl p-2 text-left transition-colors duration-150 hover:bg-white/[0.05] focus-visible:bg-white/[0.05] focus-visible:outline-none">
                  
                        <img src={f.poster} alt="" className="h-14 w-[38px] rounded-md object-cover ring-1 ring-white/10" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-fg">{f.title}</span>
                          <span className="block text-xs text-fg-subtle">
                            {f.year} · {f.director}
                          </span>
                        </span>
                      </button>
                    </li>
              )}
                  {results.length === 0 &&
              <li className="px-4 py-10 text-center text-sm text-fg-subtle">No films match “{query}”.</li>
              }
                </ul>
              </div> :

          <div className="grid gap-6 p-6 sm:grid-cols-[132px_minmax(0,1fr)]">
                <div className="hidden sm:block">
                  <Poster film={film} linked={false} />
                  {!logDialog.filmId &&
              <button
                type="button"
                onClick={() => setFilmId(undefined)}
                className="mt-3 w-full text-center text-xs text-fg-subtle transition-colors hover:text-fg">
                
                      Change film
                    </button>
              }
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
                    max={TODAY_ISO}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-10 w-full rounded-xl bg-white/[0.05] px-3 text-sm text-fg ring-1 ring-inset ring-line focus:outline-none focus:ring-gold/50" />
                  
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
                      Review <span className="tabular-nums text-fg-faint">{review.length > 0 && `${review.length} / ${MAX_REVIEW}`}</span>
                    </span>
                    <textarea
                  value={review}
                  maxLength={MAX_REVIEW}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                  placeholder="What stayed with you? (optional)"
                  className="w-full resize-none rounded-xl bg-white/[0.05] px-3.5 py-3 text-sm leading-relaxed text-fg ring-1 ring-inset ring-line placeholder:text-fg-faint focus:outline-none focus:ring-gold/50" />
                
                  </label>
                </div>
              </div>
          }

            {film &&
          <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
                <Button variant="ghost" onClick={closeLog}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="min-w-[132px]">
                  {saving ? 'Saving…' : 'Save to diary'}
                </Button>
              </div>
          }
          </motion.div>
        </div>
      }
    </AnimatePresence>);

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
      className={`inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[13px] font-medium ring-1 ring-inset transition-[background-color,color,transform] duration-150 ease-cinema active:scale-[0.97] ${
      active ? 'bg-gold/[0.12] text-gold ring-gold/40' : 'bg-white/[0.04] text-fg-muted ring-line hover:text-fg'}`
      }>
      
      {children}
      {label}
    </button>);

}