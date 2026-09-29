import React, { useEffect, useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SpotlightCard } from '../components/discover/SpotlightCard';
import { Poster } from '../components/film/Poster';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { becauseYouLoved, genres, popularWithFriends, trendingFilmIds } from '../data/discover';
import { getFilm, getFilms, getUser, searchFilms } from '../utils/films';

export function Discover() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const genre = params.get('genre');
  const [input, setInput] = useState(query);

  useEffect(() => setInput(query), [query]);

  const update = (next: {q?: string;genre?: string | null;}) => {
    const q = next.q ?? input;
    const g = next.genre === undefined ? genre : next.genre;
    const out: Record<string, string> = {};
    if (q.trim()) out.q = q;
    if (g) out.genre = g;
    setParams(out, { replace: true });
  };

  const searching = Boolean(query.trim() || genre);
  const results = searchFilms(query, genre);
  const [spotlightId, ...trendingRest] = trendingFilmIds;
  const spotlight = getFilm(spotlightId);
  const sourceFilm = getFilm(becauseYouLoved.sourceFilmId);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      <header>
        <h1 className="text-[36px] font-semibold leading-tight tracking-display sm:text-[42px]">Discover</h1>
        <p className="mt-1 text-[15px] text-fg-subtle">What should tonight’s film be?</p>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: input });
          }}
          className="relative mt-8">
          
          <SearchIcon size={20} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              update({ q: e.target.value });
            }}
            aria-label="Search films, directors and cast"
            placeholder="Search by title, director or cast"
            className="h-14 w-full rounded-2xl bg-surface pl-14 pr-14 text-base text-fg ring-1 ring-inset ring-line placeholder:text-fg-faint transition-[box-shadow,background-color] duration-150 hover:bg-surface-raised focus:bg-surface-raised focus:outline-none focus:ring-gold/50" />
          
          {input &&
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setInput('');
              update({ q: '' });
            }}
            className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-fg-subtle hover:bg-white/[0.06] hover:text-fg">
            
              <XIcon size={16} />
            </button>
          }
        </form>

        <div className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by genre">
          {genres.map((g) => {
            const active = g === genre;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => update({ genre: active ? null : g })}
                className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium ring-1 ring-inset transition-[background-color,color,transform] duration-150 ease-cinema active:scale-[0.97] ${
                active ? 'bg-gold text-gold-ink ring-transparent' : 'bg-white/[0.04] text-fg-muted ring-line hover:bg-white/[0.08] hover:text-fg'}`
                }>
                
                {g}
              </button>);

          })}
        </div>
      </header>

      {searching ?
      <section aria-live="polite" className="mt-12">
          <p className="mb-6 text-sm text-fg-subtle">
            {results.length} {results.length === 1 ? 'film' : 'films'}
            {query.trim() && <> for “<span className="text-fg">{query}</span>”</>}
            {genre && <> in <span className="text-fg">{genre}</span></>}
          </p>
          {results.length > 0 ?
        <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6">
              {results.map((film) =>
          <li key={film.id}>
                  <Poster film={film} />
                  <p className="mt-3 truncate text-[13px] font-medium text-fg">{film.title}</p>
                  <p className="text-xs text-fg-subtle">{film.year}</p>
                </li>
          )}
            </ul> :

        <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
              <p className="text-[15px] font-medium">Nothing on the reel</p>
              <p className="mt-1.5 text-sm text-fg-subtle">Try a different title, a director’s name, or clear the genre.</p>
              <Button variant="secondary" size="sm" className="mt-5" onClick={() => setParams({}, { replace: true })}>
                Clear filters
              </Button>
            </div>
        }
        </section> :

      <div className="mt-12 space-y-20">
          {spotlight && <SpotlightCard film={spotlight} />}

          <section aria-labelledby="trending-heading">
            <SectionHeader id="trending-heading" title="Trending this week" description="Most logged across FrameLog" />
            <ol className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
              {getFilms(trendingRest).map((film, i) =>
            <li key={film.id} className="flex items-end">
                  <span aria-hidden className="-mr-3 select-none text-[88px] font-semibold leading-[0.75] tracking-display text-white/[0.09]">
                    {i + 2}
                  </span>
                  <Poster film={film} className="relative z-10 w-full" />
                </li>
            )}
            </ol>
          </section>

          <section aria-labelledby="friends-heading">
            <SectionHeader id="friends-heading" title="Popular with friends" description="What the people you follow can’t stop logging" />
            <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6">
              {popularWithFriends.map((item) => {
              const film = getFilm(item.filmId);
              if (!film) return null;
              return (
                <li key={item.filmId}>
                    <Poster film={film} />
                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex -space-x-1.5">
                        {item.friendIds.map((id) =>
                      <Avatar key={id} user={getUser(id)} size="xs" className="ring-2 ring-canvas" />
                      )}
                      </span>
                      <span className="text-xs text-fg-subtle">{item.count} friends</span>
                    </div>
                  </li>);

            })}
            </ul>
          </section>

          {sourceFilm &&
        <section aria-labelledby="because-heading">
              <SectionHeader
            id="because-heading"
            title={
            <>
                    Because you loved <span className="text-gold-soft">{sourceFilm.title}</span>
                  </>
            }
            description="Quiet, nocturnal, intimate — films in the same key" />
          
              <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 sm:gap-5 lg:grid-cols-6">
                {getFilms(becauseYouLoved.filmIds).map((film) =>
            <li key={film.id}>
                    <Poster film={film} />
                  </li>
            )}
              </ul>
            </section>
        }
        </div>
      }
    </div>);

}