import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { users } from '../../data/users';
import { Avatar } from '../ui/Avatar';
import { ButtonLink } from '../ui/Button';
import { PosterWall } from './PosterWall';

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-b border-line">
      <PosterWall />
      <div className="absolute inset-0 bg-canvas/[0.8]" aria-hidden />
      <div className="absolute inset-0 shadow-[inset_0_0_240px_120px_#09090B]" aria-hidden />

      <div className="relative mx-auto w-full max-w-[1200px] px-6 pb-24 pt-36 text-center">
        <h1
          id="hero-title"
          className="mx-auto max-w-[14ch] text-[52px] font-semibold leading-[0.95] tracking-[-0.05em] sm:text-[80px] lg:text-[104px]">
          
          Your life, <span className="text-gold">in film.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-[34rem] text-lg leading-relaxed text-fg-muted sm:text-xl">
          FrameLog is the diary for people who take cinema seriously. Log what you watch, write what you feel, and follow
          the friends whose taste you trust.
        </p>

        <div className="mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink to="/register" size="lg" className="group w-full sm:w-auto">
            Start your diary — it’s free
            <ArrowRightIcon size={17} className="transition-transform duration-150 ease-cinema group-hover:translate-x-0.5" />
          </ButtonLink>
          <ButtonLink to="/app" variant="secondary" size="lg" className="w-full backdrop-blur-md sm:w-auto">
            Explore the app
          </ButtonLink>
        </div>

        <div className="mt-14 flex items-center justify-center gap-3">
          <span className="flex -space-x-2">
            {users.slice(1, 6).map((user) =>
            <Avatar key={user.id} user={user} size="sm" className="ring-2 ring-canvas" />
            )}
          </span>
          <p className="text-left text-sm text-fg-subtle">
            <span className="font-medium text-fg">2.1 million</span> people keep
            <br className="sm:hidden" /> their film diary here
          </p>
        </div>
      </div>
    </section>);

}