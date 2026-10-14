import React from 'react';
import { twMerge } from 'tailwind-merge';
import type { User } from '../../types/social';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-[13px]',
  lg: 'h-14 w-14 text-base',
  xl: 'h-24 w-24 text-2xl sm:h-28 sm:w-28 sm:text-[28px]'
};

type AvatarProps = {
  user: User;
  size?: AvatarSize;
  className?: string;
};

export function Avatar({ user, size = 'md', className }: AvatarProps) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={twMerge('inline-block shrink-0 rounded-full object-cover ring-1 ring-inset ring-white/10', sizes[size], className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={user.name}
      style={{ backgroundColor: user.tone || 'rgba(212, 175, 55, 0.2)' }}
      className={twMerge(
        'inline-grid shrink-0 select-none place-items-center rounded-full font-semibold tracking-wide text-fg ring-1 ring-inset ring-white/10',
        sizes[size],
        className
      )}>
      {user.initials || user.name?.[0]?.toUpperCase() || 'U'}
    </span>
  );
}