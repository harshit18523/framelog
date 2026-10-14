import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import asyncHandler from '../utils/asyncHandler';
import ApiResponse from '../utils/ApiResponse';
import Follow from '../models/Follow';
import DiaryEntry from '../models/DiaryEntry';
import WatchedFilm from '../models/WatchedFilm';

function formatRelativeTime(date?: Date | string): string {
  if (!date) return 'Recently';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;

  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * @desc    Get social activity feed for current user
 * @route   GET /api/feed
 * @access  Private
 */
export const getFeed = asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentUserId = req.user!._id;

  // Find all users the current user follows
  const follows = await Follow.find({ followerId: currentUserId }).select('followingId').lean();
  const followingIds = follows.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        { items: [], followingCount: 0 },
        'Following no users'
      )
    );
  }

  // Fetch recent diary entries from followed users
  const diaryEntries = await DiaryEntry.find({ userId: { $in: followingIds } })
    .populate('userId', '_id name username avatar bio')
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  // Fetch recent watched films from followed users
  const watchedFilms = await WatchedFilm.find({ userId: { $in: followingIds } })
    .populate('userId', '_id name username avatar bio')
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  // Build a set of user+film pairs already covered by diary
  const diaryUserFilms = new Set(
    diaryEntries.map((d) => {
      const uId = (d.userId as any)?._id?.toString() || (d.userId as any)?.toString();
      return `${uId}:${d.filmId}`;
    })
  );

  // Filter out watched films that already have a diary entry from the same user
  const uniqueWatched = watchedFilms.filter((w) => {
    const uId = (w.userId as any)?._id?.toString() || (w.userId as any)?.toString();
    return !diaryUserFilms.has(`${uId}:${w.filmId}`);
  });

  // Combine and sort
  const combined = [
    ...diaryEntries.map((d) => ({ ...d, itemType: 'diary' })),
    ...uniqueWatched.map((w) => ({ ...w, itemType: 'watched' })),
  ].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const items = combined.slice(0, 30).map((entry) => {
    const user = entry.userId as any;
    const isDiary = entry.itemType === 'diary';
    const hasReview = Boolean(isDiary && (entry as any).review);

    return {
      id: entry._id.toString(),
      userId: user?._id?.toString() || '',
      user: user
        ? {
            id: user._id.toString(),
            name: user.name,
            handle: user.username,
            username: user.username,
            avatar: user.avatar || '',
            initials: (user.name || 'U')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
            tone: 'gold',
          }
        : undefined,
      kind: hasReview ? 'review' : 'watched',
      filmId: entry.filmId,
      film: entry.film,
      rating: isDiary ? (entry as any).rating : undefined,
      text: hasReview ? (entry as any).review : undefined,
      rewatch: isDiary ? Boolean((entry as any).rewatch) : false,
      time: formatRelativeTime(entry.createdAt),
      likes: 0,
      comments: 0,
      createdAt: entry.createdAt,
    };
  });

  return res.status(200).json(
    new ApiResponse(
      { items, followingCount: followingIds.length },
      'Feed retrieved successfully'
    )
  );
});
