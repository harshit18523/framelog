import React from 'react';
import { HeartIcon } from 'lucide-react';
import { profileLists } from '../../data/library';
import { getFilms } from '../../utils/films';

export function ProfileLists() {
  return (
    <ul className="grid gap-x-10 gap-y-12 md:grid-cols-2">
      {profileLists.map((list) =>
      <li key={list.id}>
          <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas">
          
            <div className="flex">
              {getFilms(list.filmIds).map((film, i) =>
            <div
              key={film.id}
              style={{ zIndex: 10 - i }}
              className={`w-1/4 shrink-0 transition-transform duration-300 ease-cinema ${
              i > 0 ? '-ml-[6%]' : ''} ${
              ['', 'group-hover:translate-x-2', 'group-hover:translate-x-4', 'group-hover:translate-x-6'][i]}`}>
              
                  <div className="overflow-hidden rounded-xl shadow-poster ring-1 ring-white/10">
                    <img src={film.poster} alt="" className="aspect-[2/3] w-full object-cover" />
                  </div>
                </div>
            )}
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-semibold tracking-title text-fg transition-colors group-hover:text-gold-soft">
                {list.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-fg-subtle">{list.description}</p>
              <p className="mt-3 flex items-center gap-3 text-xs text-fg-faint">
                {list.filmCount} films
                <span className="inline-flex items-center gap-1">
                  <HeartIcon size={11} /> {list.likes.toLocaleString()}
                </span>
              </p>
            </div>
          </a>
        </li>
      )}
    </ul>);

}