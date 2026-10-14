import React, { useEffect, useRef, useState } from 'react';
import {
  PlusIcon,
  SearchIcon,
  LogOutIcon,
  Loader2Icon,
  StarIcon,
  MessageSquareIcon,
  FilmIcon,
  UsersIcon,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLibrary } from '../../contexts/LibraryContext';
import { useAuth } from '../../contexts/AuthContext';
import { currentUser } from '../../data/users';
import { Logo } from '../brand/Logo';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { NotificationsMenu } from './NotificationsMenu';
import { searchFilmsApi } from '../../api/films.api';
import { searchUsersApi, UserSearchResult } from '../../api/users.api';
import { getOrCreateConversationApi } from '../../api/chats.api';
import { cacheFilms } from '../../utils/films';
import { formatUserForUi } from '../../utils/user';
import type { Film } from '../../types/film';

export function TopBar() {
  const navigate = useNavigate();
  const { openLog } = useLibrary();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Film[]>([]);
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'films' | 'people'>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time search with debounce (350ms) for both TMDB Films and People
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setUserResults([]);
      setSearching(false);
      setIsOpen(false);
      return;
    }

    let isMounted = true;
    setSearching(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const [filmsSettled, usersSettled] = await Promise.allSettled([
          searchFilmsApi(q),
          searchUsersApi(q),
        ]);

        if (!isMounted) return;

        if (filmsSettled.status === 'fulfilled') {
          cacheFilms(filmsSettled.value.results);
          setResults(filmsSettled.value.results.slice(0, 5));
        } else {
          console.error('[TopBar] Film search error:', filmsSettled.reason);
          setResults([]);
        }

        if (usersSettled.status === 'fulfilled') {
          setUserResults(usersSettled.value.slice(0, 5));
        } else {
          console.error('[TopBar] Users search error:', usersSettled.reason);
          setUserResults([]);
        }
      } catch (err) {
        console.error('[TopBar] Search exception:', err);
        if (isMounted) {
          setResults([]);
          setUserResults([]);
        }
      } finally {
        if (isMounted) setSearching(false);
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/app/discover?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectFilm = (filmId: string) => {
    navigate(`/app/film/${filmId}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleSelectUser = (targetUsername: string) => {
    navigate(`/app/profile/${targetUsername}`);
    setIsOpen(false);
    setQuery('');
  };

  const handleStartMessage = async (e: React.MouseEvent, targetUserId: string) => {
    e.stopPropagation();
    try {
      const conv = await getOrCreateConversationApi(targetUserId);
      setIsOpen(false);
      setQuery('');
      navigate(`/app/chats?id=${conv.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not start conversation');
    }
  };

  const activeUser = user || currentUser;
  const hasFilms = results.length > 0;
  const hasUsers = userResults.length > 0;
  const hasAnyResults = hasFilms || hasUsers;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-[1520px] items-center gap-4 px-4 sm:px-6">
        <div className="shrink-0 lg:w-[216px]">
          <Logo to="/app" />
        </div>

        {/* Global Real-time Search: Films + People */}
        <div className="relative hidden max-w-lg flex-1 sm:block">
          <form role="search" onSubmit={handleSubmit} className="relative">
            <label htmlFor="global-search" className="sr-only">
              Search films and people
            </label>
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle"
            />
            <input
              ref={inputRef}
              id="global-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim() && (hasFilms || hasUsers)) setIsOpen(true);
              }}
              placeholder="Search films & people in real-time..."
              className="h-10 w-full rounded-full bg-white/[0.05] pl-10 pr-14 text-sm text-fg ring-1 ring-inset ring-line placeholder:text-fg-subtle transition-[background-color,box-shadow] duration-150 hover:bg-white/[0.07] focus:bg-white/[0.07] focus:outline-none focus:ring-gold/50"
            />
            {searching ? (
              <Loader2Icon
                size={15}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-gold"
              />
            ) : (
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line-strong px-1.5 py-0.5 font-sans text-[11px] text-fg-subtle">
                ⌘K
              </kbd>
            )}
          </form>

          {/* Real-time search dropdown results */}
          {isOpen && query.trim() && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-12 z-50 max-h-[80vh] overflow-y-auto rounded-2xl border border-line-strong bg-surface-raised/95 p-2 shadow-elevated backdrop-blur-2xl"
            >
              {searching && !hasAnyResults ? (
                <div className="flex items-center justify-center gap-2 py-6 text-xs text-fg-subtle">
                  <Loader2Icon size={14} className="animate-spin text-gold" /> Searching films & people...
                </div>
              ) : hasAnyResults ? (
                <div className="space-y-3">
                  {/* Category switcher pills if both exist */}
                  {hasFilms && hasUsers && (
                    <div className="flex items-center gap-1 border-b border-line px-1 pb-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setActiveFilter('all')}
                        className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                          activeFilter === 'all'
                            ? 'bg-gold/15 text-gold'
                            : 'text-fg-subtle hover:text-fg'
                        }`}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFilter('films')}
                        className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                          activeFilter === 'films'
                            ? 'bg-gold/15 text-gold'
                            : 'text-fg-subtle hover:text-fg'
                        }`}
                      >
                        Films ({results.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFilter('people')}
                        className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                          activeFilter === 'people'
                            ? 'bg-gold/15 text-gold'
                            : 'text-fg-subtle hover:text-fg'
                        }`}
                      >
                        People ({userResults.length})
                      </button>
                    </div>
                  )}

                  {/* Section: People */}
                  {(activeFilter === 'all' || activeFilter === 'people') && hasUsers && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                        <UsersIcon size={12} className="text-gold" />
                        People
                      </div>
                      <ul className="space-y-0.5">
                        {userResults.map((u) => (
                          <li key={u.id}>
                            <div
                              onClick={() => handleSelectUser(u.username)}
                              className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.06]"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <Avatar user={formatUserForUi(u)} size="sm" />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-fg group-hover:text-gold transition-colors">
                                    {u.name}
                                  </p>
                                  <p className="truncate text-xs text-fg-subtle">@{u.username}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {u.isFollowing && (
                                  <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] text-fg-muted">
                                    Following
                                  </span>
                                )}
                                {!u.isSelf && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartMessage(e, u.id)}
                                    title="Send Message"
                                    className="grid h-8 w-8 place-items-center rounded-lg text-fg-subtle hover:bg-gold/20 hover:text-gold transition-colors"
                                  >
                                    <MessageSquareIcon size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Section: Films */}
                  {(activeFilter === 'all' || activeFilter === 'films') && hasFilms && (
                    <div>
                      <div className="flex items-center gap-1.5 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                        <FilmIcon size={12} className="text-gold" />
                        Films
                      </div>
                      <ul className="space-y-1">
                        {results.map((film) => (
                          <li key={film.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectFilm(film.id)}
                              className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.06]"
                            >
                              {film.poster ? (
                                <img
                                  src={film.poster}
                                  alt=""
                                  className="h-11 w-8 rounded-md object-cover ring-1 ring-white/10"
                                />
                              ) : (
                                <div className="grid h-11 w-8 place-items-center rounded-md bg-white/[0.06] text-[9px] text-fg-faint">
                                  Art
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-fg group-hover:text-gold transition-colors">
                                  {film.title}
                                </p>
                                <p className="text-xs text-fg-subtle">
                                  {film.year || '—'}{' '}
                                  {film.director && film.director !== 'Various'
                                    ? `· ${film.director}`
                                    : ''}
                                </p>
                              </div>
                              {film.averageRating > 0 && (
                                <span className="flex items-center gap-1 text-xs text-gold">
                                  <StarIcon size={12} fill="currentColor" />
                                  {film.averageRating.toFixed(1)}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* See all search results footer */}
                  <div className="border-t border-line pt-1">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full rounded-lg py-1.5 text-center text-xs text-fg-muted hover:text-gold transition-colors"
                    >
                      See all movie results for “{query}” →
                    </button>
                  </div>
                </div>
              ) : !searching ? (
                <div className="py-6 text-center text-xs text-fg-subtle">
                  No films or people found for “{query}”
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/app/discover"
            aria-label="Search"
            className="grid h-10 w-10 place-items-center rounded-full text-fg-muted hover:bg-white/[0.06] hover:text-fg sm:hidden"
          >
            <SearchIcon size={18} />
          </Link>
          <Button size="sm" onClick={() => openLog()} className="hidden h-9 pl-3 sm:inline-flex">
            <PlusIcon size={16} strokeWidth={2.25} />
            Log film
          </Button>
          <NotificationsMenu />
          <Link
            to="/app/profile"
            aria-label="Your profile"
            className="rounded-full transition-transform duration-150 ease-cinema hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            <Avatar user={activeUser} size="sm" />
          </Link>
          <button
            type="button"
            onClick={logout}
            title="Log out"
            aria-label="Log out"
            className="grid h-9 w-9 place-items-center rounded-full text-fg-subtle hover:bg-white/[0.06] hover:text-rose-400 transition-colors"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
