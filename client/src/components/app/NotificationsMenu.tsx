import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, SparklesIcon, CheckCheckIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';

export interface AppNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  unread: boolean;
}

const DEFAULT_WELCOME_NOTIFICATION: AppNotification = {
  id: 'welcome',
  title: 'Welcome to FrameLog!',
  text: 'Welcome to FrameLog! Start by logging your first film.',
  time: 'Just now',
  unread: true,
};

export function NotificationsMenu() {
  const { user } = useAuth();
  const { openLog } = useLibrary();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const storageKey = `framelog_notifications_${user?.id || user?._id || 'guest'}`;

  const [items, setItems] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [DEFAULT_WELCOME_NOTIFICATION];
  });

  // Keep items updated if user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems([DEFAULT_WELCOME_NOTIFICATION]);
      }
    } catch {
      setItems([DEFAULT_WELCOME_NOTIFICATION]);
    }
  }, [storageKey]);

  const unread = items.filter((n) => n.unread).length;

  const markAllRead = () => {
    const updated = items.map((n) => ({ ...n, unread: false }));
    setItems(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (item: AppNotification) => {
    const updated = items.map((n) => (n.id === item.id ? { ...n, unread: false } : n));
    setItems(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setOpen(false);
    if (item.id === 'welcome') {
      openLog();
    }
  };

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
        className="relative grid h-10 w-10 place-items-center rounded-full text-fg-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
      >
        <BellIcon size={18} />
        {unread > 0 && (
          <span
            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-gold ring-2 ring-canvas"
            aria-hidden
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'top right' }}
            className="absolute right-0 top-12 z-50 w-[340px] overflow-hidden rounded-2xl bg-surface-raised/95 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-fg">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-fg-subtle transition-colors hover:text-gold"
                >
                  <CheckCheckIcon size={14} /> Mark all read
                </button>
              )}
            </div>

            <ul className="p-2 space-y-1">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleNotificationClick(n)}
                    className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors duration-150 hover:bg-white/[0.05]"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/25">
                      <SparklesIcon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-snug text-fg">{n.title}</p>
                      <p className="mt-0.5 text-xs text-fg-subtle">{n.text}</p>
                      <span className="mt-1 block text-[11px] text-fg-faint">{n.time}</span>
                    </div>
                    {n.unread && (
                      <span
                        className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold"
                        aria-label="Unread"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationsMenu;