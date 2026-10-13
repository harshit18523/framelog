import React, { useEffect, useState } from 'react';
import { SearchIcon, XIcon, Loader2Icon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SpotlightCard } from '../components/discover/SpotlightCard';
import { Poster } from '../components/film/Poster';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { cacheFilms } from '../utils/films';
import { getTrendingFilmsApi, getPopularFilmsApi, searchFilmsApi } from '../api/films.api';
import type { Film } from '../types/film';

const GENRE_FILTERS = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

export function Discover() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const genre = params.get('genre');
  const [input, setInput] = useState(query);

  const [trendingFilms, setTrendingFilms] = useState<Film[]>([]);
  const [popularFilms, setPopularFilms] = useState<Film[]>([]);
  const [searchResults, setSearchResults] = useState<Film[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Sync input when URL parameter changes
  useEffect(() => setInput(query), [query]);

  // Load real trending and popular films on mount
  useEffect(() => {
    let isMounted = true;
    const loadFilms = async () => {
      setLoadingInitial(true);
      try {
        const [trendingRes, popularRes] = await Promise.all([
          getTrendingFilmsApi('week').catch(() => ({ results: [] })),
          getPopularFilmsApi().catch(() => ({ results: [] })),
        ]);

        if (!isMounted) return;

        if (trendingRes.results && trendingRes.results.length > 0) {
          cacheFilms(trendingRes.results);
          setTrendingFilms(trendingRes.results);
        }

        if (popularRes.results && popularRes.results.length > 0) {
          cacheFilms(popularRes.results);
          setPopularFilms(popularRes.results);
        }
      } catch (err) {
        console.error('[Discover] Failed to fetch TMDB films:', err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    };

    loadFilms();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time debounced search (350ms)
  useEffect(() => {
    const hasSearch = Boolean(query.trim() || genre);
    if (!hasSearch) {
      setSearchResults([]);
      setLoadingSearch(false);
      return;
    }

    let isMounted = true;
    setLoadingSearch(true);

    const timer = setTimeout(async () => {
      try {
        const res = await searchFilmsApi(query, genre);
        if (!isMounted) return;
        cacheFilms(res.results);
        setSearchResults(res.results);
      } catch (err) {
        console.error('[Discover] Real-time search error:', err);
        if (isMounted) setSearchResults([]);
      } finally {
        if (isMounted) setLoadingSearch(false);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, genre]);

  const update = (next: { q?: string; genre?: string | null }) => {
    const q = next.q ?? input;
    const g = next.genre === undefined ? genre : next.genre;
    const out: Record<string, string> = {};
    if (q.trim()) out.q = q;
    if (g) out.genre = g;
    setParams(out, { replace: true });
  };

  const searching = Boolean(query.trim() || genre);
  const spotlight = trendingFilms[0] || popularFilms[0];
  const trendingRest = trendingFilms.slice(1, 11);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
      <header>
        <h1 className="text-[36px] font-semibold leading-tight tracking-display sm:text-[42px]">Discover</h1>
        <p className="mt-1 text-[15px] text-fg-subtle">What should tonight’s film be?</p>

        {/* Real-time Search Input */}
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: input });
          }}
          className="relative mt-8"
        >
          <SearchIcon
            size={20}
            className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              update({ q: e.target.value });
            }}
            aria-label="Search films by title, director or keyword"
            placeholder="Search by title, director or keyword in real-time..."
            className="h-14 w-full rounded-2xl bg-surface pl-14 pr-14 text-base text-fg ring-1 ring-inset ring-line placeholder:text-fg-faint transition-[box-shadow,background-color] duration-150 hover:bg-surface-raised focus:bg-surface-raised focus:outline-none focus:ring-gold/50"
          />

          {loadingSearch && (
            <Loader2Icon
              size={18}
              className="absolute right-12 top-1/2 -translate-y-1/2 animate-spin text-gold"
            />
          )}

          {input && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setInput('');
                update({ q: '' });
              }}
              className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-fg-subtle hover:bg-white/[0.06] hover:text-fg"
            >
              <XIcon size={16} />
            </button>
          )}
        </form>

        {/* Genre Filters */}
        <div
          className="scrollbar-none -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
          role="group"
          aria-label="Filter by genre"
        >
          {GENRE_FILTERS.map((g) => {
            const active = g.toLowerCase() === genre?.toLowerCase();
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                onClick={() => update({ genre: active ? null : g })}
                className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-medium ring-1 ring-inset transition-[background-color,color,transform] duration-150 ease-cinema active:scale-[0.97] ${
                  active
                    ? 'bg-gold text-gold-ink ring-transparent'
                    : 'bg-white/[0.04] text-fg-muted ring-line hover:bg-white/[0.08] hover:text-fg'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </header>

      {/* Search Results Mode */}
      {searching ? (
        <section aria-live="polite" className="mt-12">
          <p className="mb-6 text-sm text-fg-subtle">
            {loadingSearch ? (
              <span className="flex items-center gap-2">
                <Loader2Icon size={14} className="animate-spin text-gold" /> Searching TMDB database in real-time...
              </span>
            ) : (
              <>
                {searchResults.length} {searchResults.length === 1 ? 'film' : 'films'}
                {query.trim() && (
                  <>
                    {' '}
                    for “<span className="text-fg">{query}</span>”
                  </>
                )}
                {genre && (
                  <>
                    {' '}
                    in <span className="text-fg">{genre}</span>
                  </>
                )}
              </>
            )}
          </p>

          {searchResults.length > 0 ? (
            <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6">
              {searchResults.map((film) => (
                <li key={film.id}>
                  <Poster film={film} />
                  <p className="mt-3 truncate text-[13px] font-medium text-fg">{film.title}</p>
                  <p className="text-xs text-fg-subtle">{film.year || '—'}</p>
                </li>
              ))}
            </ul>
          ) : !loadingSearch ? (
            <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
              <p className="text-[15px] font-medium">Nothing on the reel</p>
              <p className="mt-1.5 text-sm text-fg-subtle">
                Try a different title, a director’s name, or clear the genre filter.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-5"
                onClick={() => setParams({}, { replace: true })}
              >
                Clear filters
              </Button>
            </div>
          ) : null}
        </section>
      ) : (
        /* Default Browse Mode: Real TMDB Trending & Popular */
        <div className="mt-12 space-y-20">
          {loadingInitial && !spotlight ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <Loader2Icon size={32} className="animate-spin text-gold" />
              <p className="text-sm text-fg-subtle">Loading films from TMDB...</p>
            </div>
          ) : (
            <>
              {spotlight && <SpotlightCard film={spotlight} />}

              {trendingRest.length > 0 && (
                <section aria-labelledby="trending-heading">
                  <SectionHeader
                    id="trending-heading"
                    title="Trending this week"
                    description="Most logged movies across the globe"
                  />
                  <ol className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
                    {trendingRest.map((film, i) => (
                      <li key={film.id} className="flex items-end">
                        <span
                          aria-hidden
                          className="-mr-3 select-none text-[88px] font-semibold leading-[0.75] tracking-display text-white/[0.09]"
                        >
                          {i + 2}
                        </span>
                        <Poster film={film} className="relative z-10 w-full" />
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {popularFilms.length > 0 && (
                <section aria-labelledby="popular-now-heading">
                  <SectionHeader
                    id="popular-now-heading"
                    title="Popular right now"
                    description="Audience favorites captivating viewers worldwide"
                  />
                  <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6">
                    {popularFilms.slice(0, 18).map((film) => (
                      <li key={film.id}>
                        <Poster film={film} />
                        <p className="mt-3 truncate text-[13px] font-medium text-fg">{film.title}</p>
                        <p className="text-xs text-fg-subtle">{film.year || '—'}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Discover;
