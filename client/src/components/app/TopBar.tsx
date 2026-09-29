import React, { useEffect, useRef, useState } from 'react';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../contexts/LibraryContext';
import { currentUser } from '../../data/users';
import { Logo } from '../brand/Logo';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { NotificationsMenu } from './NotificationsMenu';

export function TopBar() {
  const navigate = useNavigate();
  const { openLog } = useLibrary();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/app/discover?q=${encodeURIComponent(query.trim())}` : '/app/discover');
    inputRef.current?.blur();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-[1520px] items-center gap-4 px-4 sm:px-6">
        <div className="shrink-0 lg:w-[216px]">
          <Logo to="/app" />
        </div>

        <form role="search" onSubmit={handleSubmit} className="relative hidden max-w-lg flex-1 sm:block">
          <label htmlFor="global-search" className="sr-only">
            Search films, people and lists
          </label>
          <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            ref={inputRef}
            id="global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search films, people, lists"
            className="h-10 w-full rounded-full bg-white/[0.05] pl-10 pr-14 text-sm text-fg ring-1 ring-inset ring-line placeholder:text-fg-subtle transition-[background-color,box-shadow] duration-150 hover:bg-white/[0.07] focus:bg-white/[0.07] focus:outline-none focus:ring-gold/50" />
          
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line-strong px-1.5 py-0.5 font-sans text-[11px] text-fg-subtle">
            ⌘K
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/app/discover"
            aria-label="Search"
            className="grid h-10 w-10 place-items-center rounded-full text-fg-muted hover:bg-white/[0.06] hover:text-fg sm:hidden">
            
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
            className="rounded-full transition-transform duration-150 ease-cinema hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas">
            
            <Avatar user={currentUser} size="sm" />
          </Link>
        </div>
      </div>
    </header>);

}