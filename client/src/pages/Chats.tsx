import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquareIcon,
  SearchIcon,
  SendIcon,
  Loader2Icon,
  PlusIcon,
  XIcon,
  ArrowLeftIcon,
  CheckIcon,
  CheckCheckIcon,
  FilmIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import {
  getConversationsApi,
  getConversationMessagesApi,
  sendMessageApi,
  markConversationReadApi,
  getOrCreateConversationApi,
  ConversationItem,
  ChatMessage,
} from '../api/chats.api';
import { searchUsersApi, UserSearchResult } from '../api/users.api';
import { formatUserForUi } from '../utils/user';

export function Chats() {
  const { user: authUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedId = searchParams.get('id');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(requestedId);
  const [currentConversation, setCurrentConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // New Chat modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState('');
  const [modalResults, setModalResults] = useState<UserSearchResult[]>([]);
  const [modalSearching, setModalSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // 1. Fetch conversations list
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingConversations(true);
    try {
      const data = await getConversationsApi();
      setConversations(data);
    } catch (err: any) {
      console.error('[Chats] Error fetching conversations:', err);
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Periodic polling for conversations (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // 2. Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingMessages(true);
    try {
      const res = await getConversationMessagesApi(convId);
      setMessages(res.messages || []);
      if (res.conversation) {
        setCurrentConversation(res.conversation as any);
      }
      // Mark as read in local state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId || c._id === convId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err: any) {
      console.error('[Chats] Error fetching messages:', err);
      if (!silent) toast.error('Could not load messages');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  // 3. Central conversation selection handler (ensures URL and state stay in sync)
  const handleSelectConversation = useCallback(
    (convId: string) => {
      if (!convId) return;
      setActiveId(convId);
      setSearchParams({ id: convId }, { replace: true });
      fetchMessages(convId);
      markConversationReadApi(convId).catch(() => {});
    },
    [setSearchParams, fetchMessages]
  );

  // 4. Sync when URL query parameter changes (initial load, back/forward, external navigation)
  useEffect(() => {
    if (requestedId) {
      setActiveId(requestedId);
      fetchMessages(requestedId);
    }
  }, [requestedId, fetchMessages]);

  // Periodic polling for active conversation messages (every 2.5 seconds)
  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(() => {
      fetchMessages(activeId, true);
    }, 2500);
    return () => clearInterval(interval);
  }, [activeId, fetchMessages]);

  // Auto-scroll when messages update
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // 5. Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = messageText.trim();
    if (!text || !activeId || sending) return;

    setMessageText('');
    setSending(true);

    // Optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      _id: tempId,
      conversationId: activeId,
      sender: {
        id: authUser?.id || 'me',
        _id: authUser?.id || 'me',
        name: authUser?.name || 'Me',
        username: authUser?.username || 'me',
        avatar: authUser?.avatar,
      },
      content: text,
      read: false,
      isMine: true,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom(true);

    try {
      const sentMsg = await sendMessageApi(activeId, text);
      // Replace optimistic message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? sentMsg : m))
      );
      // Update conversation in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId || c._id === activeId
            ? {
                ...c,
                lastMessage: {
                  content: text,
                  senderId: authUser?.id || 'me',
                  createdAt: sentMsg.createdAt,
                },
                updatedAt: sentMsg.createdAt,
              }
            : c
        )
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMessageText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Keyboard Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 6. New Chat modal user search with debounce
  useEffect(() => {
    const q = modalQuery.trim();
    if (!q) {
      setModalResults([]);
      setModalSearching(false);
      return;
    }

    setModalSearching(true);
    const timer = setTimeout(async () => {
      try {
        const users = await searchUsersApi(q);
        setModalResults(users.filter((u) => !u.isSelf));
      } catch (err) {
        console.error('[Chats] Modal search error:', err);
      } finally {
        setModalSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [modalQuery]);

  const handleStartConversationWithUser = async (targetUserId: string) => {
    try {
      const conv = await getOrCreateConversationApi(targetUserId);
      setIsModalOpen(false);
      setModalQuery('');
      setModalResults([]);

      const convId = conv.id || conv._id;
      // Prepend to conversations if not already in list
      setConversations((prev) => {
        if (!prev.some((c) => (c.id || c._id) === convId)) {
          return [conv, ...prev];
        }
        return prev;
      });

      handleSelectConversation(convId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Could not start conversation');
    }
  };

  const activeConversation =
    conversations.find((c) => (c.id && c.id === activeId) || (c._id && c._id === activeId)) ||
    currentConversation ||
    null;
  const otherUser = activeConversation?.otherUser;

  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const name = c.otherUser?.name || '';
    const username = c.otherUser?.username || '';
    const q = searchFilter.toLowerCase();
    return name.toLowerCase().includes(q) || username.toLowerCase().includes(q);
  });

  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'h:mm a');
    } catch {
      return '';
    }
  };

  const formatHeaderDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMMM d, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4.5rem)] w-full max-w-[1520px] overflow-hidden p-2 sm:p-4 lg:p-6">
      <div className="flex w-full overflow-hidden rounded-2xl border border-line bg-surface/80 shadow-2xl backdrop-blur-xl">
        
        {/* ================= LEFT PANEL: Conversation List ================= */}
        <aside
          className={`flex w-full flex-col border-r border-line bg-surface-raised/40 lg:w-80 xl:w-96 ${
            activeId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Top Header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
            <div className="flex items-center gap-2.5">
              <MessageSquareIcon size={19} className="text-gold" />
              <h1 className="text-base font-semibold text-fg">Messages</h1>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsModalOpen(true)}
              className="h-8 gap-1 rounded-xl px-2.5 text-xs text-gold hover:bg-gold/15"
            >
              <PlusIcon size={14} />
              New chat
            </Button>
          </div>

          {/* Search bar inside conversation list */}
          <div className="border-b border-line p-3">
            <div className="relative">
              <SearchIcon
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
              />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search conversations..."
                className="h-9 w-full rounded-xl bg-white/[0.05] pl-9 pr-3 text-xs text-fg ring-1 ring-inset ring-line placeholder:text-fg-subtle focus:outline-none focus:ring-gold/50"
              />
            </div>
          </div>

          {/* Conversation list scrollable container */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2Icon size={20} className="animate-spin text-gold" />
              </div>
            ) : filteredConversations.length > 0 ? (
              <ul className="divide-y divide-white/[0.04]">
                {filteredConversations.map((conv) => {
                  const convId = conv.id || conv._id;
                  const isActive = convId === activeId;
                  const other = conv.otherUser;
                  const uiUser = formatUserForUi(other || undefined);

                  return (
                    <li key={convId}>
                      <button
                        type="button"
                        onClick={() => handleSelectConversation(convId)}
                        className={`flex w-full items-center gap-3 p-3.5 text-left transition-colors ${
                          isActive
                            ? 'bg-gold/[0.12] border-l-2 border-gold'
                            : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar user={uiUser as any} size="md" />
                          {conv.unreadCount > 0 && (
                            <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-canvas">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="truncate text-sm font-medium text-fg">
                              {other?.name || 'Unknown User'}
                            </p>
                            {conv.lastMessage && (
                              <span className="shrink-0 text-[11px] text-fg-subtle">
                                {formatMessageTime(conv.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-fg-muted">
                            {conv.lastMessage ? conv.lastMessage.content : 'No messages yet'}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-16 text-center">
                <MessageSquareIcon size={28} className="mx-auto text-fg-subtle/50" />
                <p className="mt-3 text-sm font-medium text-fg">No conversations</p>
                <p className="mt-1 text-xs text-fg-subtle">
                  Start a new conversation with film enthusiasts.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 gap-1.5"
                >
                  <PlusIcon size={14} />
                  Find people
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* ================= RIGHT PANEL: Active Chat Window ================= */}
        <main
          className={`flex flex-1 flex-col bg-canvas/60 ${
            !activeId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeId && otherUser ? (
            <>
              {/* Active Chat Header */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-surface/70 px-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(null);
                      setSearchParams({}, { replace: true });
                    }}
                    aria-label="Back to conversations"
                    className="grid h-8 w-8 place-items-center rounded-lg text-fg-subtle hover:bg-white/[0.06] hover:text-fg lg:hidden"
                  >
                    <ArrowLeftIcon size={18} />
                  </button>

                  <Link
                    to={`/app/profile/${otherUser.username}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar user={formatUserForUi(otherUser) as any} size="sm" />
                    <div>
                      <h2 className="text-sm font-semibold text-fg group-hover:text-gold transition-colors">
                        {otherUser.name}
                      </h2>
                      <p className="text-[11px] text-fg-subtle">@{otherUser.username}</p>
                    </div>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/profile/${otherUser.username}`}
                    className="rounded-lg px-2.5 py-1 text-xs text-fg-subtle hover:bg-white/[0.06] hover:text-gold transition-colors"
                  >
                    View profile
                  </Link>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2Icon size={24} className="animate-spin text-gold" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const prevMsg = messages[index - 1];
                    const showDateHeader =
                      !prevMsg ||
                      new Date(prevMsg.createdAt).toDateString() !==
                        new Date(msg.createdAt).toDateString();

                    return (
                      <React.Fragment key={msg.id || msg._id}>
                        {showDateHeader && (
                          <div className="my-4 flex items-center justify-center">
                            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-fg-subtle ring-1 ring-inset ring-line">
                              {formatHeaderDate(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-2 ${
                            msg.isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!msg.isMine && (
                            <Avatar
                              user={formatUserForUi(msg.sender) as any}
                              size="xs"
                              className="mb-1"
                            />
                          )}

                          <div
                            className={`group relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
                              msg.isMine
                                ? 'rounded-tr-xs bg-gradient-to-br from-amber-600/35 to-gold/25 text-fg ring-1 ring-gold/40'
                                : 'rounded-tl-xs bg-surface-raised/90 text-fg ring-1 ring-line'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <div
                              className={`mt-1 flex items-center gap-1 text-[10px] ${
                                msg.isMine ? 'justify-end text-gold/80' : 'text-fg-subtle'
                              }`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {msg.isMine && (
                                <span title={msg.read ? 'Read' : 'Delivered'}>
                                  {msg.read ? (
                                    <CheckCheckIcon size={12} className="text-gold" />
                                  ) : (
                                    <CheckIcon size={12} />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gold/10 text-gold ring-1 ring-gold/20">
                      <FilmIcon size={22} />
                    </div>
                    <p className="mt-3 text-sm font-medium text-fg">
                      Start the discussion with {otherUser.name}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-fg-subtle">
                      Discuss cinema, recommend films, or exchange thoughts on your latest watchlist.
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="border-t border-line bg-surface/70 p-3 sm:p-4 backdrop-blur-md">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-end gap-2"
                >
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${otherUser.name}... (Press Enter to send)`}
                    className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl bg-white/[0.05] px-3.5 py-2.5 text-sm text-fg ring-1 ring-inset ring-line placeholder:text-fg-subtle focus:outline-none focus:ring-gold/50"
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim() || sending}
                    size="sm"
                    className="h-[42px] w-[42px] shrink-0 rounded-xl bg-gold p-0 text-canvas hover:bg-gold-light disabled:opacity-40"
                  >
                    {sending ? (
                      <Loader2Icon size={16} className="animate-spin" />
                    ) : (
                      <SendIcon size={16} />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Empty State when no conversation is selected */
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.04] text-gold ring-1 ring-line">
                <MessageSquareIcon size={30} />
              </div>
              <h2 className="mt-4 text-base font-semibold text-fg">Your Messages</h2>
              <p className="mt-1.5 max-w-sm text-xs text-fg-subtle">
                Connect directly with fellow film lovers. Pick an existing chat from the left or
                start a new conversation.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="mt-6 gap-1.5"
              >
                <PlusIcon size={15} />
                Start a new conversation
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* ================= NEW CHAT USER PICKER MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-line-strong bg-surface-raised p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-semibold text-fg">New Conversation</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-fg-subtle hover:bg-white/[0.06] hover:text-fg"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <SearchIcon
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle"
                />
                <input
                  autoFocus
                  value={modalQuery}
                  onChange={(e) => setModalQuery(e.target.value)}
                  placeholder="Type name or @username..."
                  className="h-10 w-full rounded-xl bg-white/[0.05] pl-9 pr-3 text-sm text-fg ring-1 ring-inset ring-line placeholder:text-fg-subtle focus:outline-none focus:ring-gold/50"
                />
                {modalSearching && (
                  <Loader2Icon
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gold"
                  />
                )}
              </div>
            </div>

            <div className="mt-4 max-h-64 overflow-y-auto">
              {modalSearching && modalResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-fg-subtle">
                  Searching users...
                </div>
              ) : modalResults.length > 0 ? (
                <ul className="space-y-1">
                  {modalResults.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => handleStartConversationWithUser(u.id)}
                        className="flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar user={formatUserForUi(u) as any} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-fg">{u.name}</p>
                            <p className="text-xs text-fg-subtle">@{u.username}</p>
                          </div>
                        </div>
                        <span className="rounded-lg bg-gold/15 px-2 py-1 text-[11px] font-medium text-gold">
                          Chat
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : modalQuery.trim() ? (
                <div className="py-8 text-center text-xs text-fg-subtle">
                  No users found matching “{modalQuery}”
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-fg-subtle">
                  Search for a user by name or username to start chatting.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chats;
