import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from 'lucide-react';

type LikeButtonProps = {
  count: number;
  label?: string;
};

export function LikeButton({ count, label = 'Like' }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={`${label}, ${count + (liked ? 1 : 0)} likes`}
      onClick={() => setLiked((v) => !v)}
      className={`group inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 -ml-2.5 text-[13px] tabular-nums transition-colors duration-150 hover:bg-white/[0.05] ${
      liked ? 'text-gold' : 'text-fg-subtle hover:text-fg-muted'}`
      }>
      
      <motion.span
        key={String(liked)}
        initial={liked ? { scale: 0.7 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        className="inline-flex">
        
        <HeartIcon size={15} fill={liked ? 'currentColor' : 'none'} />
      </motion.span>
      {count + (liked ? 1 : 0)}
    </button>);

}