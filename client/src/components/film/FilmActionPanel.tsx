import React, { useState } from 'react';
import { BookmarkIcon, EyeIcon, HeartIcon, PenLineIcon, LayersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useLibrary } from '../../contexts/LibraryContext';
import type { Film } from '../../types/film';
import { Button } from '../ui/Button';
import { RatingInput } from '../ui/RatingInput';
import { AddToListDialog } from '../lists/AddToListDialog';

type FilmActionPanelProps = {
  film: Film;
};

export function FilmActionPanel({ film }: FilmActionPanelProps) {
  const [addToListOpen, setAddToListOpen] = useState(false);
  const { isWatched, watchlist, liked, ratingFor, toggleWatched, toggleWatchlist, toggleLiked, setRating, openLog } =
  useLibrary();
  const watched = isWatched(film.id);
  const inWatchlist = watchlist.includes(film.id);
  const isLiked = liked.includes(film.id);

  const actions = [
  {
    id: 'watched',
    label: watched ? 'Watched' : 'Watch',
    icon: EyeIcon,
    active: watched,
    onClick: () => {
      toggleWatched(film.id);
      toast(watched ? `Removed ${film.title} from watched` : `Marked ${film.title} as watched`);
    }
  },
  {
    id: 'like',
    label: isLiked ? 'Liked' : 'Like',
    icon: HeartIcon,
    active: isLiked,
    onClick: () => toggleLiked(film.id)
  },
  {
    id: 'watchlist',
    label: 'Watchlist',
    icon: BookmarkIcon,
    active: inWatchlist,
    onClick: () => {
      toggleWatchlist(film.id);
      toast(inWatchlist ? 'Removed from your watchlist' : `${film.title} added to your watchlist`);
    }
  }];


  return (
    <div className="rounded-2xl bg-surface/80 p-5 ring-1 ring-inset ring-line backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              aria-pressed={action.active}
              onClick={action.onClick}
              className={`flex h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl text-xs font-medium transition-[background-color,color,transform] duration-150 ease-cinema active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
              action.active ? 'bg-gold/[0.12] text-gold' : 'bg-white/[0.04] text-fg-muted hover:bg-white/[0.07] hover:text-fg'}`
              }>
              
              <Icon size={19} fill={action.active && action.id !== 'watched' ? 'currentColor' : 'none'} />
              {action.label}
            </button>);

        })}
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <p className="mb-2.5 text-xs text-fg-subtle">{ratingFor(film.id) ? 'Your rating' : 'Rate this film'}</p>
        <RatingInput
          value={ratingFor(film.id)}
          onChange={(value) => {
            setRating(film.id, value);
            if (value) toast(`Rated ${film.title} ${value} stars`);
          }} />
        
      </div>

      <div className="mt-5 space-y-2.5">
        <Button onClick={() => openLog({ filmId: film.id })} className="w-full">
          <PenLineIcon size={16} /> Review or log
        </Button>
        <Button
          variant="secondary"
          onClick={() => setAddToListOpen(true)}
          className="w-full gap-2"
        >
          <LayersIcon size={16} /> Add to list
        </Button>
      </div>

      <AddToListDialog
        open={addToListOpen}
        onClose={() => setAddToListOpen(false)}
        film={film}
      />
    </div>);

}