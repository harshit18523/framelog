import React, { useState } from 'react';
import { starFill } from '../../utils/ratings';
import { StarGlyph } from './StarGlyph';

type RatingInputProps = {
  value?: number;
  onChange: (value: number | undefined) => void;
  size?: number;
  label?: string;
};

export function RatingInput({ value, onChange, size = 26, label = 'Your rating' }: RatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  const valueFromPointer = (event: React.MouseEvent<HTMLSpanElement>, index: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientX - rect.left < rect.width / 2 ? index - 0.5 : index;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = value ?? 0;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(5, current + 0.5));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(current <= 0.5 ? undefined : current - 0.5);
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      onChange(undefined);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={value ?? 0}
        aria-valuetext={value ? `${value} out of 5 stars` : 'Not rated'}
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHover(null)}
        className="-m-1 flex cursor-pointer items-center gap-1 rounded-lg p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
        
        {[1, 2, 3, 4, 5].map((i) =>
        <span
          key={i}
          onMouseMove={(e) => setHover(valueFromPointer(e, i))}
          onClick={(e) => {
            const next = valueFromPointer(e, i);
            onChange(next === value ? undefined : next);
          }}
          className="transition-transform duration-150 ease-cinema hover:scale-110 active:scale-95">
          
            <StarGlyph fill={starFill(display, i)} size={size} emptyClassName="text-white/[0.16]" />
          </span>
        )}
      </div>
      <span className="min-w-[2rem] text-sm font-medium tabular-nums text-fg-muted">
        {display ? display.toFixed(1) : '—'}
      </span>
    </div>);

}