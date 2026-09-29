import React from 'react';
import { StarIcon } from 'lucide-react';

type StarGlyphProps = {
  fill: 0 | 0.5 | 1;
  size?: number;
  emptyClassName?: string;
};

export function StarGlyph({ fill, size = 14, emptyClassName = 'text-white/[0.14]' }: StarGlyphProps) {
  return (
    <span aria-hidden className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <StarIcon size={size} strokeWidth={0} fill="currentColor" className={`absolute inset-0 ${emptyClassName}`} />
      {fill > 0 &&
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: fill === 1 ? '100%' : '50%' }}>
          <StarIcon
          size={size}
          strokeWidth={0}
          fill="currentColor"
          className="text-gold"
          style={{ width: size, height: size, maxWidth: 'none' }} />
        
        </span>
      }
    </span>);

}