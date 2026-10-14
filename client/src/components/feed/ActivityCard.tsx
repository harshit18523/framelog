import React, { useState } from 'react';
import { MessageCircleIcon, RepeatIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Activity } from '../../types/social';
import { getFilm, getFilms, getUser } from '../../utils/films';
import { Poster } from '../film/Poster';
import { Avatar } from '../ui/Avatar';
import { LikeButton } from '../ui/LikeButton';
import { StarRating } from '../ui/StarRating';

type ActivityCardProps = {
  activity: Activity;
};

const verbs = { review: 'reviewed', watched: 'watched', list: 'published a list' };

export function ActivityCard({ activity }: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const user: User = activity.user
    ? {
        id: activity.userId || activity.user.id || '',
        name: activity.user.name || 'User',
        handle: activity.user.handle || (activity.user as any).username || 'user',
        initials:
          activity.user.initials ||
          (activity.user.name || 'U')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        tone: activity.user.tone || 'rgba(212, 175, 55, 0.2)',
        avatar: (activity.user as any).avatar,
      }
    : getUser(activity.userId);

  const film = (activity.film as any) || getFilm(activity.filmId);
  const verb = activity.rewatch ? 'rewatched' : verbs[activity.kind] || 'logged';

  return (
    <article className="py-7">
      <header className="flex items-center gap-3">
        <Link to={`/app/profile/${user.id || user.handle}`} className="shrink-0 transition-opacity hover:opacity-80">
          <Avatar user={user} size="sm" />
        </Link>
        <p className="min-w-0 flex-1 truncate text-sm text-fg-subtle">
          <Link to={`/app/profile/${user.id || user.handle}`} className="font-medium text-fg hover:underline">
            {user.name}
          </Link>{' '}
          {verb}
          {activity.kind === 'watched' && film && (
            <>
              {' '}
              <Link to={`/app/film/${film.id}`} className="text-fg-muted hover:text-fg">
                {film.title}
              </Link>
            </>
          )}
        </p>
        <time className="shrink-0 text-xs text-fg-faint">{activity.time}</time>
      </header>

      {activity.kind === 'review' && film &&
      <div className="mt-4 flex gap-5 sm:pl-11">
          <Poster film={film} showCaption={false} className="w-[88px] shrink-0 sm:w-[104px]" />
          <div className="min-w-0 flex-1">
            <Link
            to={`/app/film/${film.id}`}
            className="text-lg font-semibold tracking-title text-fg transition-colors hover:text-gold-soft">
            
              {film.title}
            </Link>
            <span className="ml-2 text-sm text-fg-subtle">{film.year}</span>
            {activity.rating != null && <StarRating value={activity.rating} className="mt-1.5 flex" />}
            <p className={`mt-3 text-[15px] leading-[1.65] text-fg-muted ${expanded ? '' : 'line-clamp-3'}`}>
              {activity.text}
            </p>
            {(activity.text?.length ?? 0) > 200 &&
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 text-[13px] font-medium text-fg-subtle transition-colors hover:text-fg">
            
                {expanded ? 'Show less' : 'Read more'}
              </button>
          }
            <footer className="mt-4 flex items-center gap-3">
              <LikeButton count={activity.likes} label="Like review" />
              <span className="inline-flex items-center gap-1.5 text-[13px] tabular-nums text-fg-subtle">
                <MessageCircleIcon size={15} /> {activity.comments}
              </span>
            </footer>
          </div>
        </div>
      }

      {activity.kind === 'watched' && film &&
      <div className="mt-4 flex items-center gap-4 sm:pl-11">
          <Poster film={film} showCaption={false} radius="lg" className="w-14 shrink-0" />
          <div className="flex items-center gap-3">
            {activity.rating != null && <StarRating value={activity.rating} size={15} />}
            {activity.rewatch &&
          <span className="inline-flex items-center gap-1 text-xs text-fg-subtle">
                <RepeatIcon size={13} /> Rewatch
              </span>
          }
          </div>
        </div>
      }

      {activity.kind === 'list' && activity.list &&
      <Link
        to="/app/profile?tab=lists"
        className="group mt-4 flex flex-col gap-5 rounded-2xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:ml-11 sm:flex-row sm:items-center">
        
          <div className="flex shrink-0">
            {getFilms(activity.list.filmIds).map((f, i) =>
          <div
            key={f.id}
            style={{ zIndex: 10 - i, ['--i' as string]: i }}
            className={`w-[72px] transition-transform duration-300 ease-cinema ${i > 0 ? '-ml-8' : ''} group-hover:translate-x-[calc(var(--i)*8px)]`}>
            
                <div className="overflow-hidden rounded-lg shadow-poster ring-1 ring-white/10">
                  <img src={f.poster} alt="" className="aspect-[2/3] w-full object-cover" />
                </div>
              </div>
          )}
          </div>
          <div>
            <p className="text-lg font-semibold tracking-title text-fg transition-colors group-hover:text-gold-soft">
              {activity.list.title}
            </p>
            <p className="mt-1 text-sm text-fg-subtle">
              {activity.list.filmCount} films · {activity.likes} likes
            </p>
          </div>
        </Link>
      }
    </article>);

}