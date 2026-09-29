import React from 'react';
import { Link } from 'react-router-dom';

type LogoProps = {
  to?: string;
};

export function Logo({ to = '/' }: LogoProps) {
  return (
    <Link
      to={to}
      aria-label="FrameLog home"
      className="inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
      
      <span aria-hidden className="grid h-7 w-7 place-items-center rounded-[8px] bg-gold">
        <span className="relative h-[15px] w-[11px] rounded-[2.5px] border-[1.75px] border-gold-ink">
          <span className="absolute inset-x-0 top-1/2 h-[1.75px] -translate-y-1/2 bg-gold-ink" />
        </span>
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-fg">FrameLog</span>
    </Link>);

}