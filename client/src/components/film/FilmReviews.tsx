import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PenLineIcon,
  HeartIcon,
  RepeatIcon,
  UsersIcon,
  Loader2Icon,
  UserPlusIcon,
} from 'lucide-react';
import { useLibrary } from '../../contexts/LibraryContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Film } from '../../types/film';
import { formatDay } from '../../utils/dates';
import { formatUserForUi } from '../../utils/user';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { StarRating } from '../ui/StarRating';
import { ReviewComments } from './ReviewComments';
import { getFriendsFilmReviewsApi, FriendReviewItem } from '../../api/reviews.api';

type FilmReviewsProps = {
  film: Film;
};

export function FilmReviews({ film }: FilmReviewsProps) {
  const { entries, openLog } = useLibrary();
  const { user } = useAuth();

  const [friendsReviews, setFriendsReviews] = useState<FriendReviewItem[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // User's own review from local / MongoDB diary
  const userEntry = entries.find((e) => e.filmId === film.id && e.review);

  // Fetch real reviews from friends (people the user follows)
  useEffect(() => {
    let isMounted = true;
    setLoadingFriends(true);

    getFriendsFilmReviewsApi(film.id)
      .then((data) => {
        if (!isMounted) return;
        setFriendsReviews(data);
      })
      .catch((err) => {
        console.error('[FilmReviews] Error fetching friends reviews:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingFriends(false);
      });

    return () => {
      isMounted = false;
    };
  }, [film.id]);

  const hasAnyReviews = Boolean(userEntry || friendsReviews.length > 0);

  return (
    <section aria-labelledby="reviews-heading" className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UsersIcon size={20} className="text-gold" />
            <h2 id="reviews-heading" className="text-xl font-semibold tracking-title text-fg">
              Friends' Reviews
            </h2>
            {friendsReviews.length > 0 && (
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
                {friendsReviews.length}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-fg-subtle">
            Thoughts and discussions from people you follow
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => openLog({ filmId: film.id })}
          className="gap-1.5"
        >
          <PenLineIcon size={14} />
          {userEntry ? 'Edit your review' : 'Write a review'}
        </Button>
      </div>

      {loadingFriends ? (
        <div className="flex h-36 items-center justify-center gap-2.5 text-fg-subtle">
          <Loader2Icon size={20} className="animate-spin text-gold" />
          <span className="text-xs">Loading friends' reviews...</span>
        </div>
      ) : !hasAnyReviews ? (
        <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/[0.04] text-fg-subtle ring-1 ring-line">
            <UsersIcon size={22} />
          </div>
          <p className="mt-4 text-[15px] font-medium text-fg">No reviews from friends yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-fg-subtle">
            Follow other film lovers to see their thoughts on {film.title} and join the conversation.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link to="/app/chats">
              <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                <UserPlusIcon size={13} /> Find people
              </Button>
            </Link>
            <Button
              size="sm"
              variant="primary"
              onClick={() => openLog({ filmId: film.id })}
              className="gap-1.5 text-xs"
            >
              <PenLineIcon size={13} /> Be the first to review
            </Button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {/* 1. Current user's own review */}
          {userEntry && (
            <li className="py-6">
              <div className="grid gap-3.5 sm:grid-cols-[40px_minmax(0,1fr)]">
                <Avatar
                  user={formatUserForUi(user as any) as any}
                  size="md"
                  className="hidden sm:inline-grid"
                />
                <article className="min-w-0">
                  <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-sm font-semibold text-fg">
                      {user?.name || 'You'}
                      <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                        You
                      </span>
                    </p>
                    {userEntry.rating != null && <StarRating value={userEntry.rating} />}
                    {userEntry.liked && (
                      <span title="Liked" className="text-rose-400">
                        <HeartIcon size={13} fill="currentColor" />
                      </span>
                    )}
                    {userEntry.rewatch && (
                      <span
                        title="Rewatch"
                        className="flex items-center gap-1 rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-fg-subtle"
                      >
                        <RepeatIcon size={10} /> Rewatch
                      </span>
                    )}
                    <time className="text-xs text-fg-faint">
                      {formatDay(userEntry.date, 'MMM d, yyyy')}
                    </time>
                  </header>

                  <p className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-fg-muted">
                    {userEntry.review}
                  </p>

                  {/* Comments on own review */}
                  {userEntry.id && (
                    <ReviewComments
                      reviewId={userEntry.id}
                      reviewerUsername={user?.username}
                    />
                  )}
                </article>
              </div>
            </li>
          )}

          {/* 2. Reviews from followed friends */}
          {friendsReviews.map((item) => {
            const uiUser = formatUserForUi(item.user);

            return (
              <li key={item.id || item._id} className="py-6">
                <div className="grid gap-3.5 sm:grid-cols-[40px_minmax(0,1fr)]">
                  <Link
                    to={`/app/profile/${item.user.username}`}
                    className="hidden sm:inline-grid group"
                  >
                    <Avatar user={uiUser as any} size="md" />
                  </Link>
                  <article className="min-w-0">
                    <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link
                        to={`/app/profile/${item.user.username}`}
                        className="text-sm font-semibold text-fg hover:text-gold transition-colors"
                      >
                        {item.user.name}
                      </Link>
                      <span className="text-xs text-fg-subtle">@{item.user.username}</span>

                      {item.rating != null && <StarRating value={item.rating} />}

                      {item.liked && (
                        <span title="Liked" className="text-rose-400">
                          <HeartIcon size={13} fill="currentColor" />
                        </span>
                      )}

                      {item.rewatch && (
                        <span
                          title="Rewatch"
                          className="flex items-center gap-1 rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-fg-subtle"
                        >
                          <RepeatIcon size={10} /> Rewatch
                        </span>
                      )}

                      <time className="text-xs text-fg-faint">
                        {formatDay(item.date, 'MMM d, yyyy')}
                      </time>
                    </header>

                    <p className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-fg-muted">
                      {item.review}
                    </p>

                    {/* Comments & Replies */}
                    <ReviewComments
                      reviewId={item.id || item._id}
                      initialCount={item.commentsCount}
                      reviewerUsername={item.user.username}
                    />
                  </article>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default FilmReviews;
