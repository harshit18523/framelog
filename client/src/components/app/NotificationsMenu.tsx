import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notifications as initialNotifications } from '../../data/activity';
import { getFilm, getUser } from '../../utils/films';
import { Avatar } from '../ui/Avatar';

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => n.unread).length;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-fg-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60">
        
        <BellIcon size={18} />
        {unread > 0 &&
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold ring-2 ring-canvas" aria-hidden />
        }
      </button>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: 'top right' }}
          className="absolute right-0 top-12 w-[340px] overflow-hidden rounded-2xl bg-surface-raised/85 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl">
          
            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <p className="text-sm font-semibold">Notifications</p>
              {unread > 0 &&
            <button
              type="button"
              onClick={() => setItems((prev) => prev.map((n) => ({ ...n, unread: false })))}
              className="text-xs text-fg-subtle transition-colors hover:text-fg">
              
                  Mark all read
                </button>
            }
            </div>
            <ul className="p-2">
              {items.map((n) => {
              const user = getUser(n.userId);
              const film = n.filmId ? getFilm(n.filmId) : undefined;
              return (
                <li key={n.id}>
                    <Link
                    to={film ? `/app/film/${film.id}` : '/app/profile'}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 transition-colors duration-150 hover:bg-white/[0.05]">
                    
                      <Avatar user={user} size="sm" />
                      <p className="flex-1 text-[13px] leading-snug text-fg-muted">
                        <span className="font-medium text-fg">{user.name}</span> {n.text}
                        <span className="mt-1 block text-xs text-fg-faint">{n.time} ago</span>
                      </p>
                      {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-label="Unread" />}
                    </Link>
                  </li>);

            })}
            </ul>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}