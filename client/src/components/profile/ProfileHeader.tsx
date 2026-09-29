import React from 'react';
import { MapPinIcon, ShareIcon } from 'lucide-react';
import { toast } from 'sonner';
import { currentUser, profileStats } from '../../data/users';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

export function ProfileHeader() {
  return (
    <header className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <Avatar user={currentUser} size="xl" className="ring-2 ring-white/10" />
        <div className="min-w-0">
          <h1 className="text-[34px] font-semibold leading-tight tracking-display sm:text-[44px]">{currentUser.name}</h1>
          <p className="mt-1 flex items-center gap-3 text-sm text-fg-subtle">
            @{currentUser.handle}
            <span className="inline-flex items-center gap-1">
              <MapPinIcon size={13} /> {currentUser.location}
            </span>
          </p>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-fg-muted">{currentUser.bio}</p>
          <div className="mt-5 flex items-center gap-2">
            <Button variant="secondary" size="sm">
              Edit profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Share profile"
              className="w-8 px-0"
              onClick={() => toast('Profile link copied')}>
              
              <ShareIcon size={15} />
            </Button>
          </div>
        </div>
      </div>

      <dl className="flex items-end gap-8 lg:gap-10">
        <div>
          <dt className="text-xs text-fg-subtle">Films</dt>
          <dd className="mt-1 text-[44px] font-semibold leading-none tabular-nums tracking-display">
            {profileStats.filmsWatched.toLocaleString()}
          </dd>
        </div>
        <div className="mb-1 h-12 w-px bg-line" aria-hidden />
        {[
        { label: 'This year', value: profileStats.thisYear },
        { label: 'Lists', value: profileStats.lists },
        { label: 'Avg rating', value: profileStats.averageRating.toFixed(1) },
        { label: 'Followers', value: profileStats.followers.toLocaleString() }].
        map((stat) =>
        <div key={stat.label} className="hidden sm:block">
            <dt className="text-xs text-fg-subtle">{stat.label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{stat.value}</dd>
          </div>
        )}
      </dl>
    </header>);

}