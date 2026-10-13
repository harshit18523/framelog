import React from 'react';
import { PenLineIcon } from 'lucide-react';
import { useLibrary } from '../../contexts/LibraryContext';
import { useAuth } from '../../contexts/AuthContext';
import { reviews } from '../../data/activity';
import { currentUser } from '../../data/users';
import type { Film } from '../../types/film';
import { getUser } from '../../utils/films';
import { formatDay } from '../../utils/dates';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { LikeButton } from '../ui/LikeButton';
import { StarRating } from '../ui/StarRating';

type FilmReviewsProps = {
  film: Film;
};

export function FilmReviews({ film }: FilmReviewsProps) {
  const { entries, openLog } = useLibrary();
  const { user } = useAuth();
  const activeUser = user || currentUser;

  const userEntry = entries.find((e) => e.filmId === film.id && e.review);
  const communityReviews = reviews.filter((r) => r.filmId === film.id);

  const hasAnyReviews = Boolean(userEntry || communityReviews.length > 0);

  return (
    <section aria-labelledby="reviews-heading">
      <div className="mb-2 flex items-end justify-between">
        <div>
          <h2 id="reviews-heading" className="text-xl font-semibold tracking-title">
            Reviews
          </h2>
          <p className="mt-1 text-sm text-fg-subtle">From your diary and the FrameLog community</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => openLog({ filmId: film.id })}>
          <PenLineIcon size={14} /> Write a review
        </Button>
      </div>

      {!hasAnyReviews ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-fg">No reviews yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-fg-subtle">
            Be the first of your friends to say something about {film.title}.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {/* User's own review from MongoDB diary */}
          {userEntry && (
            <li className="grid gap-4 py-7 sm:grid-cols-[40px_minmax(0,1fr)]">
              <Avatar user={activeUser} size="md" className="hidden sm:inline-grid" />
              <article>
                <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-sm font-medium text-fg">
                    {activeUser.name} <span className="ml-1.5 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold">You</span>
                  </p>
                  {userEntry.rating != null && <StarRating value={userEntry.rating} />}
                  <time className="text-xs text-fg-faint">Logged {formatDay(userEntry.date, 'MMM d, yyyy')}</time>
                </header>
                <p className="mt-3 max-w-[64ch] text-[15px] leading-[1.7] text-fg-muted">{userEntry.review}</p>
              </article>
            </li>
          )}

          {/* Community reviews */}
          {communityReviews.map((review) => {
            const reviewer = getUser(review.userId);
            return (
              <li key={review.id} className="grid gap-4 py-7 sm:grid-cols-[40px_minmax(0,1fr)]">
                <Avatar user={reviewer} size="md" className="hidden sm:inline-grid" />
                <article>
                  <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-sm font-medium text-fg">{reviewer.name}</p>
                    <StarRating value={review.rating} />
                    <time className="text-xs text-fg-faint">{review.date}</time>
                  </header>
                  <p className="mt-3 max-w-[64ch] text-[15px] leading-[1.7] text-fg-muted">{review.text}</p>
                  <div className="mt-3">
                    <LikeButton count={review.likes} label="Like review" />
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default FilmReviews;
