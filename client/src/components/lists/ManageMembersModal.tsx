import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  XIcon,
  SearchIcon,
  Loader2Icon,
  UsersIcon,
  UserMinusIcon,
  UserPlusIcon,
  ShieldIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import {
  addMemberApi,
  removeMemberApi,
  searchUsersToInviteApi,
} from '../../api/lists.api';
import type { UserList, SearchUserResult } from '../../types/list';

type ManageMembersModalProps = {
  open: boolean;
  onClose: () => void;
  list: UserList;
  currentUserId: string;
  onListUpdated: (updated: UserList) => void;
};

const ease = [0.23, 1, 0.32, 1] as const;

function Avatar({
  src,
  name,
  size = 32,
}: {
  src?: string;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-1 ring-white/10"
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-gold/20 text-[11px] font-bold text-gold ring-1 ring-gold/30"
    >
      {initials}
    </div>
  );
}

export function ManageMembersModal({
  open,
  onClose,
  list,
  currentUserId,
  onListUpdated,
}: ManageMembersModalProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null); // username being added
  const [removing, setRemoving] = useState<string | null>(null); // userId being removed
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const listId = list.id || list._id || '';

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSearchResults([]);
    }
  }, [open]);

  // Debounced search
  const doSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 1) {
        setSearchResults([]);
        return;
      }
      setSearching(true);
      try {
        const results = await searchUsersToInviteApi(listId, q.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [listId]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  const handleAdd = async (user: SearchUserResult) => {
    setAdding(user.username);
    try {
      const updated = await addMemberApi(listId, { username: user.username, role: 'editor' });
      onListUpdated(updated);
      toast.success(`${user.username} added as editor`);
      setQuery('');
      setSearchResults([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add member');
    } finally {
      setAdding(null);
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    setRemoving(memberId);
    try {
      const updated = await removeMemberApi(listId, memberId);
      onListUpdated(updated);
      toast.success(`${memberName} removed from list`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  const members = list.members || [];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="members-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.26, ease }}
            className="relative flex max-h-[calc(100vh-24px)] w-full max-w-[520px] flex-col overflow-hidden rounded-[24px] bg-surface-raised/95 shadow-elevated ring-1 ring-line-strong backdrop-blur-2xl"
          >
            {/* Top gold accent hairline */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 z-20 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(245,166,35,0.9), transparent)',
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gold/15 text-gold">
                  <UsersIcon size={16} />
                </div>
                <div>
                  <h2 id="members-modal-title" className="text-base font-semibold text-fg">
                    Manage Members
                  </h2>
                  <p className="text-[11px] text-fg-subtle">
                    {members.length} editor{members.length !== 1 ? 's' : ''} ·{' '}
                    <span className="text-gold">Collaborative</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.04] text-fg-subtle ring-1 ring-inset ring-line transition-colors hover:bg-white/[0.08] hover:text-fg"
              >
                <XIcon size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Invite section */}
              <div>
                <p className="mb-3 text-[13px] font-medium text-fg-muted">Invite a user</p>
                <div className="relative">
                  <SearchIcon
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none"
                  />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by username…"
                    className="w-full rounded-xl bg-white/[0.05] py-2.5 pl-10 pr-4 text-sm text-fg ring-1 ring-inset ring-line-strong placeholder:text-fg-faint focus:bg-white/[0.08] focus:outline-none focus:ring-gold/50 transition-all"
                  />
                  {searching && (
                    <Loader2Icon
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-fg-subtle"
                    />
                  )}
                </div>

                {/* Search results */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="mt-2 overflow-hidden rounded-xl bg-canvas ring-1 ring-line"
                    >
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.04] transition-colors border-b border-line last:border-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              src={user?.avatar || user?.profilePicture}
                              name={user.username}
                              size={30}
                            />
                            <span className="text-sm font-medium text-fg truncate">
                              @{user.username}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdd(user)}
                            disabled={adding === user.username}
                            className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-gold/15 px-3 py-1.5 text-xs font-semibold text-gold transition-all hover:bg-gold/25 disabled:opacity-50"
                          >
                            {adding === user.username ? (
                              <Loader2Icon size={12} className="animate-spin" />
                            ) : (
                              <UserPlusIcon size={12} />
                            )}
                            Invite
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                  {!searching && query.trim().length > 0 && searchResults.length === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-center text-xs text-fg-subtle py-3"
                    >
                      No users found for "{query}"
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Current members */}
              <div>
                <p className="mb-3 text-[13px] font-medium text-fg-muted">Current editors</p>
                {members.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-strong py-8 text-center">
                    <UsersIcon size={22} className="text-fg-subtle" />
                    <p className="text-xs text-fg-subtle">
                      No editors yet. Invite someone above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 rounded-xl overflow-hidden ring-1 ring-line">
                    {members.map((member) => {
                      const user =
                        typeof member.user === 'object' ? member.user : null;
                      const userId = user?._id ?? (member.user as any);
                      const username = user?.username ?? 'Unknown';
                      const pic = user?.avatar || user?.profilePicture;
                      const isSelf = userId === currentUserId;

                      return (
                        <div
                          key={userId}
                          className="flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors border-b border-line last:border-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar src={pic} name={username} size={32} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-fg truncate">
                                @{username}
                                {isSelf && (
                                  <span className="ml-1.5 text-[10px] text-fg-subtle">(you)</span>
                                )}
                              </p>
                              <p className="flex items-center gap-1 text-[11px] text-fg-subtle capitalize">
                                <ShieldIcon size={10} />
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(userId, username)}
                            disabled={removing === userId}
                            title={isSelf ? 'Leave list' : 'Remove member'}
                            className="ml-3 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-fg-subtle ring-1 ring-line transition-all hover:bg-rose-500/10 hover:text-rose-400 hover:ring-rose-500/20 disabled:opacity-50"
                          >
                            {removing === userId ? (
                              <Loader2Icon size={13} className="animate-spin" />
                            ) : (
                              <UserMinusIcon size={13} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-line px-6 py-4 flex justify-end">
              <Button variant="secondary" onClick={onClose} size="sm">
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ManageMembersModal;
