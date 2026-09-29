import React from 'react';
import type { Film } from '../../types/film';
import { Logo } from '../brand/Logo';
import { StarRating } from '../ui/StarRating';
import { SocialAuthButtons } from './SocialAuthButtons';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  film: Film;
  quote: string;
  quoteAuthor: string;
  footer: React.ReactNode;
  children: React.ReactNode;
};

export function AuthLayout({ title, subtitle, film, quote, quoteAuthor, footer, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen w-full bg-canvas text-fg lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <main className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-16">
          <h1 className="text-[34px] font-semibold leading-tight tracking-display">{title}</h1>
          <p className="mt-2 text-[15px] text-fg-subtle">{subtitle}</p>

          <div className="mt-10">
            <SocialAuthButtons />
          </div>
          <div className="my-8 flex items-center gap-4" role="separator">
            <span className="h-px flex-1 bg-line" />
            <span className="text-xs text-fg-faint">or continue with email</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          {children}

          <p className="mt-10 text-center text-sm text-fg-subtle">{footer}</p>
        </main>
        <p className="text-xs text-fg-faint">© 2026 FrameLog</p>
      </div>

      <div className="relative hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-[28px] ring-1 ring-inset ring-line">
          <img src={film.backdrop ?? film.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" aria-hidden />
          <figure className="absolute inset-x-8 bottom-8 max-w-md rounded-2xl bg-black/45 p-6 ring-1 ring-inset ring-white/10 backdrop-blur-xl">
            <blockquote className="text-lg font-medium leading-relaxed text-fg">“{quote}”</blockquote>
            <figcaption className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
              <span className="text-sm text-white/75">{quoteAuthor}</span>
              <span className="flex items-center gap-2 text-sm text-white/75">
                <span className="truncate">{film.title}</span>
                <StarRating value={5} size={11} />
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>);

}