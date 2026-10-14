import React from 'react';
import {
  MapPinIcon,
  ShareIcon,
  MessageSquareIcon,
  UserCheckIcon,
  UserPlusIcon,
  Loader2Icon,
} from 'lucide-react';
import { toast } from 'sonner';
import { currentUser } from '../../data/users';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatUserForUi } from '../../utils/user';
import type { UserProfileData } from '../../api/users.api';

export interface ProfileHeaderProps {
  profile?: UserProfileData | null;
  isSelf?: boolean;
  isFollowing?: boolean;
  followersCount?: number;
  followingCount?: number;
  onFollowToggle?: () => void;
  followLoading?: boolean;
  onMessage?: () => void;
  entriesCount?: number;
}

export function ProfileHeader({
  profile,
  isSelf: propIsSelf,
  isFollowing = false,
  followersCount = 0,
  followingCount = 0,
  onFollowToggle,
  followLoading = false,
  onMessage,
  entriesCount,
}: ProfileHeaderProps) {
  const { user } = useAuth();
  const { entries } = useLibrary();

  const isSelf = propIsSelf !== undefined ? propIsSelf : !profile || profile.isSelf;
  const activeUser = profile
    ? formatUserForUi(profile)
    : user
    ? formatUserForUi(user)
    : formatUserForUi(currentUser);

  const totalFilms =
    entriesCount !== undefined
      ? entriesCount
      : profile
      ? profile.loggedFilmsCount
      : entries.length;

  return (
    <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <Avatar user={activeUser as any} size="xl" className="ring-2 ring-white/10" />
        <div className="min-w-0">
          <h1 className="text-[34px] font-semibold leading-tight tracking-display sm:text-[44px]">
            {activeUser.name}
          </h1>
          <p className="mt-1 flex items-center gap-3 text-sm text-fg-subtle">
            @{activeUser.username}
            {activeUser.location && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon size={13} /> {activeUser.location}
              </span>
            )}
          </p>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-fg-muted">
            {activeUser.bio || 'Logging cinema, writing reviews, and curating film journeys on FrameLog.'}
          </p>

          <div className="mt-5 flex items-center gap-2">
            {isSelf ? (
              <Button variant="secondary" size="sm">
                Edit profile
              </Button>
            ) : (
              <>
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={onFollowToggle}
                  disabled={followLoading}
                  className={
                    isFollowing
                      ? 'bg-white/[0.08] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                      : 'bg-gold text-canvas hover:bg-gold-light font-semibold'
                  }
                >
                  {followLoading ? (
                    <Loader2Icon size={15} className="animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <UserCheckIcon size={15} />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlusIcon size={15} />
                      Follow
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onMessage}
                  className="gap-1.5"
                >
                  <MessageSquareIcon size={15} />
                  Message
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              aria-label="Share profile"
              className="w-8 px-0"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                toast.success('Profile link copied to clipboard');
              }}
            >
              <ShareIcon size={15} />
            </Button>
          </div>
        </div>
      </div>

      <dl className="flex items-end gap-6 sm:gap-8 lg:gap-10">
        <div>
          <dt className="text-xs text-fg-subtle">Films Logged</dt>
          <dd className="mt-1 text-[38px] sm:text-[44px] font-semibold leading-none tabular-nums tracking-display">
            {totalFilms.toLocaleString()}
          </dd>
        </div>
        <div className="mb-1 h-12 w-px bg-line" aria-hidden />
        <div>
          <dt className="text-xs text-fg-subtle">Followers</dt>
          <dd className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
            {followersCount.toLocaleString()}
          </dd>
        </div>
        <div className="mb-1 h-12 w-px bg-line" aria-hidden />
        <div>
          <dt className="text-xs text-fg-subtle">Following</dt>
          <dd className="mt-1 text-xl sm:text-2xl font-semibold tabular-nums">
            {followingCount.toLocaleString()}
          </dd>
        </div>
      </dl>
    </header>
  );
}

export default ProfileHeader;
