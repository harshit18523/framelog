import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, PlusIcon, XIcon, Loader2Icon, LayersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../ui/Button';
import { CreateListDialog } from './CreateListDialog';
import type { Film } from '../../types/film';

type AddToListDialogProps = {
  open: boolean;
  onClose: () => void;
  film: Film;
};

const ease = [0.23, 1, 0.32, 1] as const;

export function AddToListDialog({ open, onClose, film }: AddToListDialogProps) {
  const { lists, addFilmToList, removeFilmFromList } = useLibrary();
  const [createOpen, setCreateOpen] = useState(false);
  const [loadingListId, setLoadingListId] = useState<string | null>(null);

  const toggleFilmInList = async (listId: string, inList: boolean) => {
    setLoadingListId(listId);
    try {
      if (inList) {
        await removeFilmFromList(listId, film.id);
        const list = lists.find((l) => (l.id || l._id) === listId);
        toast.success(`Removed from ${list?.name || 'list'}`);
      } else {
        await addFilmToList(listId, {
          filmId: film.id,
          title: film.title,
          posterPath: film.poster,
          year: film.year,
        });
        const list = lists.find((l) => (l.id || l._id) === listId);
        toast.success(`Added to ${list?.name || 'list'}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoadingListId(null);
    }
  };

  const handleCreated = async (newList: any) => {
    try {
      const newListId = newList.id || newList._id;
      await addFilmToList(newListId, {
        filmId: film.id,
        title: film.title,
        posterPath: film.poster,
        year: film.year,
      });
      toast.success(`Added ${film.title} to ${newList.name}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease }}
              onClick={onClose}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-to-list-title"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.26, ease }}
              className="relative flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden rounded-[24px] bg-surface-raised/95 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl"
            >
              {/* Top hairline accent */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 z-20 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(245,166,35,0.9), transparent)',
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div className="flex items-center gap-3">
                  {film.poster && (
                    <img
                      src={film.poster}
                      alt={film.title}
                      className="h-12 w-8 shrink-0 rounded-md object-cover ring-1 ring-white/10"
                    />
                  )}
                  <div className="min-w-0">
                    <h2
                      id="add-to-list-title"
                      className="truncate text-base font-semibold text-fg"
                    >
                      Add to list
                    </h2>
                    <p className="truncate text-xs text-fg-subtle">
                      {film.title} {film.year ? `(${film.year})` : ''}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-fg-subtle ring-1 ring-inset ring-line transition-colors hover:bg-white/[0.08] hover:text-fg"
                >
                  <XIcon size={16} />
                </button>
              </div>

              {/* Lists items */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
                {lists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.04] text-gold ring-1 ring-line">
                      <LayersIcon size={22} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-fg">No lists created yet</p>
                    <p className="mt-1 text-xs text-fg-subtle">
                      Create your first list below to add this film.
                    </p>
                  </div>
                ) : (
                  lists.map((list) => {
                    const listId = list.id || list._id!;
                    const inList = list.films?.some((f) => f.filmId === film.id);
                    const isLoading = loadingListId === listId;

                    return (
                      <button
                        key={listId}
                        type="button"
                        onClick={() => toggleFilmInList(listId, inList)}
                        disabled={isLoading}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left transition-[background-color,border-color] duration-150 ring-1 ring-inset ${
                          inList
                            ? 'bg-gold/[0.08] ring-gold/40 hover:bg-gold/[0.12]'
                            : 'bg-white/[0.03] ring-line hover:bg-white/[0.06] hover:ring-line-strong'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium ${
                              inList ? 'text-gold' : 'text-fg'
                            }`}
                          >
                            {list.name}
                          </p>
                          <p className="mt-0.5 text-xs text-fg-subtle">
                            {list.films?.length || 0} films
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isLoading ? (
                            <Loader2Icon size={16} className="animate-spin text-fg-subtle" />
                          ) : inList ? (
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-canvas">
                              <CheckIcon size={14} strokeWidth={2.5} />
                            </span>
                          ) : (
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-white/[0.06] text-fg-subtle ring-1 ring-inset ring-line">
                              <PlusIcon size={14} />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer with "+ Create new list" button */}
              <div className="flex items-center justify-between border-t border-line bg-surface/50 p-4 sm:px-6">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                  className="gap-1.5"
                >
                  <PlusIcon size={14} />
                  New list
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateListDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreated}
      />
    </>
  );
}

export default AddToListDialog;
