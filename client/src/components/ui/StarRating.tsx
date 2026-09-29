import React from 'react';
import { starFill } from '../../utils/ratings';
import { StarGlyph } from './StarGlyph';

type StarRatingProps = {
  value: number;
  size?: number;
  className?: string;
};

export function StarRating({ value, size = 13, className = '' }: StarRatingProps) {
  return (
    <span role="img" aria-label={`Rated ${value} out of 5`} className={`inline-flex items-center gap-[2px] ${className}`}>
      {[1, 2, 3, 4, 5].map((i) =>
      <StarGlyph key={i} fill={starFill(value, i)} size={size} />
      )}
    </span>);

}