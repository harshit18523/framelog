import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PenLineIcon,
  HeartIcon,
  RepeatIcon,
  UsersIcon,
  GlobeIcon,
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
import {
  getFriendsFilmReviewsApi,
  getAllFilmReviewsApi,
  FriendReviewItem,
} from '../../api/reviews.api';

type FilmReviewsProps = {
  film: Film;
};

type ReviewTab = 'friends' | 'all';

interface ReviewCardProps {
  item: FriendReviewItem;
  isCurrentUser: boolean;
}

function ReviewCard({ item, isCurrentUser }: ReviewCardProps) {
  const uiUser = formatUserForUi(item.user);
  const reviewId = item.id || item._id;

  return (
    <li className="py-6">
      <div className="grid gap-3.5 sm:grid-cols-[40px_minmax(0,1fr)]">
        {isCurrentUser ? (
          <Avatar
            user={uiUser as any}
            size="md"
            className="hidden sm:inline-grid"
          />
        ) : (
          <Link
            to={`/app/profile/${item.user.username}`}
            className="hidden sm:inline-grid group"
          >
            <Avatar user={uiUser as any} size="md" />
          </Link>
        )}

        <article className="min-w-0">
          <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {isCurrentUser ? (
              <p className="text-sm font-semibold text-fg">
                {item.user.name || 'You'}
                <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
                  You
                </span>
              </p>
            ) : (
              <>
                <Link
                  to={`/app/profile/${item.user.username}`}
                  className="text-sm font-semibold text-fg hover:text-gold transition-colors"
                >
                  {item.user.name}
                </Link>
                <span className="text-xs text-fg-subtle">@{item.user.username}</span>
              </>
            )}

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

            {item.date && (
              <time className="text-xs text-fg-faint">
                {formatDay(item.date, 'MMM d, yyyy')}
              </time>
            )}
          </header>

          <p className="mt-2.5 whitespace-pre-wrap text-[14px] leading-relaxed text-fg-muted">
            {item.review}
          </p>

          {/* Comments & Replies */}
          {reviewId && (
            <ReviewComments
              reviewId={reviewId}
              initialCount={item.commentsCount}
              reviewerUsername={item.user.username}
            />
          )}
        </article>
      </div>
    </li>
  );
}

export function FilmReviews({ film }: FilmReviewsProps) {
  const { entries, openLog } = useLibrary();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ReviewTab>('friends');
  const [friendsReviews, setFriendsReviews] = useState<FriendReviewItem[]>([]);
  const [allReviews, setAllReviews] = useState<FriendReviewItem[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);

  // User's own review from local / MongoDB diary
  const userEntry = entries.find((e) => e.filmId === film.id && e.review);

  // Fetch reviews from followed friends and from all users
  useEffect(() => {
    let isMounted = true;
    setLoadingFriends(true);
    setLoadingAll(true);

    Promise.allSettled([
      getFriendsFilmReviewsApi(film.id),
      getAllFilmReviewsApi(film.id),
    ]).then(([friendsResult, allResult]) => {
      if (!isMounted) return;

      if (friendsResult.status === 'fulfilled') {
        setFriendsReviews(friendsResult.value);
      } else {
        console.error('[FilmReviews] Error fetching friends reviews:', friendsResult.reason);
      }

      if (allResult.status === 'fulfilled') {
        setAllReviews(allResult.value);
      } else {
        console.error('[FilmReviews] Error fetching all reviews:', allResult.reason);
      }

      setLoadingFriends(false);
      setLoadingAll(false);
    });

    return () => {
      isMounted = false;
    };
  }, [film.id, userEntry?.review, userEntry?.rating]);

  // Total count for Friends' Reviews tab (friends + own review if present)
  const friendsCount = (userEntry ? 1 : 0) + friendsReviews.length;
  const hasFriendsReviews = friendsCount > 0;

  // Process all reviews display: ensure current user's review is at top with 'You' badge
  const allReviewsDisplay = useMemo(() => {
    const userReviewInAll = allReviews.find(
      (r) =>
        r.isCurrentUser ||
        (user?.id && (r.user.id === user.id || r.user._id === user.id))
    );

    if (userEntry && !userReviewInAll) {
      const localItem: FriendReviewItem = {
        id: userEntry.id || 'current-user-review',
        _id: userEntry.id || 'current-user-review',
        filmId: film.id,
        isCurrentUser: true,
        user: {
          id: user?.id || '',
          _id: user?.id || '',
          name: user?.name || 'You',
          username: user?.username || 'you',
          avatar: user?.avatar,
          bio: user?.bio,
        },
        rating: userEntry.rating,
        review: userEntry.review || '',
        liked: Boolean(userEntry.liked),
        rewatch: Boolean(userEntry.rewatch),
        date: userEntry.date,
        commentsCount: 0,
        createdAt: userEntry.date,
      };
      return [localItem, ...allReviews];
    }

    if (userReviewInAll) {
      const others = allReviews.filter((r) => r !== userReviewInAll);
      return [{ ...userReviewInAll, isCurrentUser: true }, ...others];
    }

    return allReviews;
  }, [allReviews, userEntry, user, film.id]);

  const allCount = allReviewsDisplay.length;

  return (
    <section aria-labelledby="reviews-heading" className="w-full">
      {/* Tab Switcher & Action Header */}
      <div className="mb-6 border-b border-line">
        <div className="flex flex-wrap items-end justify-between gap-4">
          {/* Swappable Tabs */}
          <div role="tablist" aria-label="Review filter" className="flex items-center gap-7">
            {/* Friends' Reviews Tab */}
            <button
              id="tab-friends-reviews"
              type="button"
              role="tab"
              aria-selected={activeTab === 'friends'}
              aria-controls="panel-friends-reviews"
              onClick={() => setActiveTab('friends')}
              className={`relative flex items-center gap-2 pb-3.5 pt-1 text-[15px] font-semibold transition-colors duration-150 focus-visible:outline-none ${
                activeTab === 'friends' ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'
              }`}
            >
              <UsersIcon
                size={18}
                className={activeTab === 'friends' ? 'text-gold' : 'text-fg-faint'}
              />
              <span id="reviews-heading">Friends' Reviews</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors ${
                  activeTab === 'friends'
                    ? 'bg-gold/15 text-gold'
                    : 'bg-white/[0.05] text-fg-faint'
                }`}
              >
                ({friendsCount})
              </span>
              {activeTab === 'friends' && (
                <motion.span
                  layoutId="reviews-tab-indicator"
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-gold"
                />
              )}
            </button>

            {/* All Reviews Tab */}
            <button
              id="tab-all-reviews"
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              aria-controls="panel-all-reviews"
              onClick={() => setActiveTab('all')}
              className={`relative flex items-center gap-2 pb-3.5 pt-1 text-[15px] font-semibold transition-colors duration-150 focus-visible:outline-none ${
                activeTab === 'all' ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted'
              }`}
            >
              <GlobeIcon
                size={18}
                className={activeTab === 'all' ? 'text-gold' : 'text-fg-faint'}
              />
              <span>All Reviews</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums transition-colors ${
                  activeTab === 'all'
                    ? 'bg-gold/15 text-gold'
                    : 'bg-white/[0.05] text-fg-faint'
                }`}
              >
                ({allCount})
              </span>
              {activeTab === 'all' && (
                <motion.span
                  layoutId="reviews-tab-indicator"
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-gold"
                />
              )}
            </button>
          </div>

          {/* Write / Edit Review Button (Always visible on both tabs) */}
          <div className="pb-2.5">
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
        </div>

        {/* Subtitle describing current view */}
        <p className="pb-3 text-xs text-fg-subtle">
          {activeTab === 'friends'
            ? 'Thoughts and discussions from people you follow'
            : 'All reviews and ratings from the FrameLog community'}
        </p>
      </div>

      {/* Tab 1: Friends' Reviews */}
      {activeTab === 'friends' && (
        <div id="panel-friends-reviews" role="tabpanel" aria-labelledby="tab-friends-reviews">
          {loadingFriends ? (
            <div className="flex h-36 items-center justify-center gap-2.5 text-fg-subtle">
              <Loader2Icon size={20} className="animate-spin text-gold" />
              <span className="text-xs">Loading friends' reviews...</span>
            </div>
          ) : !hasFriendsReviews ? (
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
              {/* Current user's own review */}
              {userEntry && (
                <ReviewCard
                  item={{
                    id: userEntry.id || 'current-user-review',
                    _id: userEntry.id || 'current-user-review',
                    filmId: film.id,
                    isCurrentUser: true,
                    user: {
                      id: user?.id || '',
                      _id: user?.id || '',
                      name: user?.name || 'You',
                      username: user?.username || 'you',
                      avatar: user?.avatar,
                      bio: user?.bio,
                    },
                    rating: userEntry.rating,
                    review: userEntry.review || '',
                    liked: Boolean(userEntry.liked),
                    rewatch: Boolean(userEntry.rewatch),
                    date: userEntry.date,
                    commentsCount: 0,
                    createdAt: userEntry.date,
                  }}
                  isCurrentUser={true}
                />
              )}

              {/* Followed friends' reviews */}
              {friendsReviews.map((item) => (
                <ReviewCard
                  key={item.id || item._id}
                  item={item}
                  isCurrentUser={Boolean(
                    item.isCurrentUser ||
                      (user?.id && (item.user.id === user.id || item.user._id === user.id))
                  )}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tab 2: All Reviews */}
      {activeTab === 'all' && (
        <div id="panel-all-reviews" role="tabpanel" aria-labelledby="tab-all-reviews">
          {loadingAll ? (
            <div className="flex h-36 items-center justify-center gap-2.5 text-fg-subtle">
              <Loader2Icon size={20} className="animate-spin text-gold" />
              <span className="text-xs">Loading all reviews...</span>
            </div>
          ) : allCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/[0.04] text-fg-subtle ring-1 ring-line">
                <GlobeIcon size={22} />
              </div>
              <p className="mt-4 text-[15px] font-medium text-fg">No reviews yet</p>
              <p className="mx-auto mt-1 max-w-sm text-xs text-fg-subtle">
                No one has shared a review for {film.title} yet. Be the first to share your thoughts with the FrameLog community!
              </p>
              <div className="mt-5 flex justify-center">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => openLog({ filmId: film.id })}
                  className="gap-1.5 text-xs"
                >
                  <PenLineIcon size={13} /> Write the first review
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {allReviewsDisplay.map((item) => (
                <ReviewCard
                  key={item.id || item._id}
                  item={item}
                  isCurrentUser={Boolean(
                    item.isCurrentUser ||
                      (user?.id && (item.user.id === user.id || item.user._id === user.id))
                  )}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default FilmReviews;
