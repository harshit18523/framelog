import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const TMDB_POSTERS = [
  'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // Oppenheimer
  'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', // Dune
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w500/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', // Inception
  'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Parasite
  'https://image.tmdb.org/t/p/w500/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg', // Past Lives
  'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', // Spirited Away
  'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', // Blade Runner 2049
];

const columnVisibility = ['', '', '', 'hidden sm:block', 'hidden md:block', 'hidden lg:block', 'hidden xl:block'];

export function PosterWall() {
  const reduceMotion = useReducedMotion();
  const columns = columnVisibility.map((_, c) => {
    const shift = (c * 3) % TMDB_POSTERS.length;
    return [...TMDB_POSTERS.slice(shift), ...TMDB_POSTERS.slice(0, shift)];
  });

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 flex w-[135%] -translate-x-1/2 -translate-y-1/2 -rotate-[7deg] gap-4 sm:w-[120%] sm:gap-5">
        {columns.map((column, i) => (
          <div key={i} className={`min-w-0 flex-1 ${columnVisibility[i]}`}>
            <motion.div
              initial={{ y: i % 2 === 0 ? '0%' : '-50%' }}
              animate={reduceMotion ? undefined : { y: i % 2 === 0 ? ['0%', '-50%'] : ['-50%', '0%'] }}
              transition={{ duration: 90 + i * 12, ease: 'linear', repeat: Infinity }}
            >
              {[...column, ...column].map((posterUrl, j) => (
                <div key={`${i}-${j}`} className="pb-4 sm:pb-5">
                  <div className="overflow-hidden rounded-xl ring-1 ring-inset ring-white/10">
                    <img
                      src={posterUrl}
                      alt=""
                      className="aspect-[2/3] w-full object-cover"
                      loading={j < 4 ? 'eager' : 'lazy'}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PosterWall;
