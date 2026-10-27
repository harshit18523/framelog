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
  WifiIcon,
  WifiOffIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isYesterday } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import {
  getConversationsApi,
  getConversationMessagesApi,
  markConversationReadApi,
  getOrCreateConversationApi,
  ConversationItem,
  ChatMessage,
} from '../api/chats.api';
import { searchUsersApi, UserSearchResult } from '../api/users.api';
import { formatUserForUi } from '../utils/user';
/**
 * Safely extracts a string user ID from any message structure,
 * whether `sender` is an object, a string ID, or `senderId` is provided.
 */
export const getMessageSenderId = (msg: any): string => {
  if (!msg) return '';

  // 1. If sender is a string ID
  if (typeof msg.sender === 'string') {
    return msg.sender.trim();
  }

  // 2. If sender is a populated user object
  if (msg.sender && typeof msg.sender === 'object') {
    const id = msg.sender.id || msg.sender._id || msg.sender.userId;
    if (id) return String(id).trim();
  }

  // 3. If senderId is provided (string, object, or ObjectId)
  if (typeof msg.senderId === 'string') {
    return msg.senderId.trim();
  }
  if (msg.senderId && typeof msg.senderId === 'object') {
    const id =
      msg.senderId.id ||
      msg.senderId._id ||
      (typeof msg.senderId.toString === 'function' && msg.senderId.toString() !== '[object Object]'
        ? msg.senderId.toString()
        : '');
    if (id) return String(id).trim();
  }

  // 4. Other fallback fields
  if (typeof msg.userId === 'string') return msg.userId.trim();
  if (typeof msg.from === 'string') return msg.from.trim();

  return '';
};

/**
 * Accurately determines if a message belongs to the current logged-in user.
 * Prioritizes client-side ID comparison over server room-broadcast flags.
 */
export const checkIsMyMessage = (
  msg: any,
  myUserId?: string | null,
  currentUsername?: string | null,
  otherUserId?: string | null
): boolean => {
  if (!msg) return false;

  // 1. Locally generated optimistic message (temp-*) is ALWAYS mine
  const msgId = String(msg.id || msg._id || '');
  if (msgId.startsWith('temp-')) {
    return true;
  }

  // 2. Extract sender ID
  const senderId = getMessageSenderId(msg);
  const normalizedMyId = String(myUserId || '').trim().toLowerCase();

  // 3. Direct ID comparison with current logged-in user
  if (senderId && normalizedMyId) {
    return senderId.toLowerCase() === normalizedMyId;
  }

  // 4. If sender ID matches other participant's ID, it is definitely NOT mine
  const normalizedOtherId = String(otherUserId || '').trim().toLowerCase();
  if (senderId && normalizedOtherId && senderId.toLowerCase() === normalizedOtherId) {
    return false;
  }

  // 5. Fallback to username matching if sender object contains username
  const senderUsername =
    msg.sender && typeof msg.sender === 'object' && typeof msg.sender.username === 'string'
      ? msg.sender.username.trim().toLowerCase()
      : '';
  const normalizedMyUsername = String(currentUsername || '').trim().toLowerCase();
  if (senderUsername && normalizedMyUsername) {
    return senderUsername === normalizedMyUsername;
  }

  // 6. Last-resort fallback to msg.isMine if explicit boolean and sender ID couldn't be extracted
  if (!senderId && typeof msg.isMine === 'boolean') {
    return msg.isMine;
  }

  return false;
};

export function Chats() {
  const { user: authUser } = useAuth();
  const {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: socketSendMessage,
    sendTyping,
    markAsRead,
  } = useSocket();

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

  // Typing indicator states
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const otherUserTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const myTypingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // New Chat modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState('');
  const [modalResults, setModalResults] = useState<UserSearchResult[]>([]);
  const [modalSearching, setModalSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const myUserId = String(
    authUser?.id || (authUser as any)?._id || (authUser as any)?.userId || ''
  ).trim();

  const activeConversation =
    conversations.find((c) => (c.id && c.id === activeId) || (c._id && c._id === activeId)) ||
    currentConversation ||
    null;

  const otherUser =
    activeConversation?.otherUser ||
    activeConversation?.participants?.find((p: any) => {
      const pid = String(p?.id || p?._id || '').trim();
      return pid && myUserId && pid.toLowerCase() !== myUserId.toLowerCase();
    }) ||
    null;

  const otherUserId = String(
    otherUser?.id || otherUser?._id || (otherUser as any)?.userId || ''
  ).trim();

  // Helper to reliably check if a message belongs to the current user
  const isMyMessage = useCallback(
    (msg: any): boolean => {
      return checkIsMyMessage(msg, myUserId, authUser?.username, otherUserId);
    },
    [myUserId, authUser?.username, otherUserId]
  );

  // Scroll to bottom on new messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // 1. Initial fetch for conversations list
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

  // 2. Fetch messages for active conversation on selection
  const fetchMessages = useCallback(async (convId: string, silent = false) => {
    if (!convId) return;
    if (!silent) setLoadingMessages(true);
    try {
      const res = await getConversationMessagesApi(convId);
      setMessages(res.messages || []);
      if (res.conversation) {
        setCurrentConversation(res.conversation as any);
      }
      // Mark as read in local list state
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

  // 3. Central conversation selection handler
  const handleSelectConversation = useCallback(
    (convId: string) => {
      if (!convId) return;
      setActiveId(convId);
      setSearchParams({ id: convId }, { replace: true });
      fetchMessages(convId);
      markAsRead(convId);
      markConversationReadApi(convId).catch(() => {});
    },
    [setSearchParams, fetchMessages, markAsRead]
  );

  // 4. Sync when URL query parameter changes
  useEffect(() => {
    if (requestedId) {
      setActiveId(requestedId);
      fetchMessages(requestedId);
    }
  }, [requestedId, fetchMessages]);

  // 5. Join active conversation room on Socket.IO and leave on switch
  useEffect(() => {
    if (!activeId) return;
    joinConversation(activeId);
    markAsRead(activeId);

    return () => {
      leaveConversation(activeId);
      setIsOtherUserTyping(false);
    };
  }, [activeId, joinConversation, leaveConversation, markAsRead]);

  // 6. Real-time Socket Event: incoming new messages
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (msg: ChatMessage) => {
      if (!msg) return;

      // If message belongs to currently active conversation
      if (msg.conversationId === activeId) {
        setMessages((prev) => {
          // Avoid duplicate additions (e.g. matching temp optimistic IDs or real IDs)
          const alreadyExists = prev.some(
            (m) =>
              (msg.id && m.id === msg.id) ||
              (msg._id && m._id === msg._id) ||
              (m.id?.startsWith('temp-') && m.content === msg.content)
          );

          if (alreadyExists) {
            return prev.map((m) =>
              m.id?.startsWith('temp-') && m.content === msg.content ? msg : m
            );
          }

          return [...prev, msg];
        });

        scrollToBottom(true);

        // If from another user in the active window, mark read
        const senderId = getMessageSenderId(msg);
        const isFromOther =
          senderId && myUserId
            ? senderId.toLowerCase() !== myUserId.toLowerCase()
            : !checkIsMyMessage(msg, myUserId, authUser?.username, otherUserId);

        if (isFromOther) {
          markAsRead(activeId);
          markConversationReadApi(activeId).catch(() => {});
        }
      }
    };

    socket.on('new_message', handleIncomingMessage);

    return () => {
      socket.off('new_message', handleIncomingMessage);
    };
  }, [socket, activeId, myUserId, authUser?.username, otherUserId, markAsRead]);

  // 7. Real-time Socket Event: conversation updated (last message & order)
  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = (data: {
      conversationId: string;
      lastMessage: { content: string; senderId: string; createdAt: string };
      updatedAt: string;
    }) => {
      setConversations((prev) => {
        const index = prev.findIndex(
          (c) => c.id === data.conversationId || c._id === data.conversationId
        );

        if (index !== -1) {
          const existingConv = prev[index];
          const isCurrentlyActive =
            existingConv.id === activeId || existingConv._id === activeId;
          const lastSenderId = String(data.lastMessage?.senderId || '').trim().toLowerCase();
          const isFromMe = Boolean(
            lastSenderId && myUserId && lastSenderId === myUserId.toLowerCase()
          );

          const updatedConv = {
            ...existingConv,
            lastMessage: data.lastMessage,
            unreadCount:
              isCurrentlyActive || isFromMe ? 0 : (existingConv.unreadCount || 0) + 1,
            updatedAt: data.updatedAt,
          };

          // Reorder: bring latest updated conversation to top
          return [updatedConv, ...prev.filter((_, i) => i !== index)];
        } else {
          // New conversation created by other user, re-fetch list to include it
          fetchConversations(true);
          return prev;
        }
      });
    };

    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket, activeId, myUserId, fetchConversations]);

  // 8. Real-time Socket Event: user typing indicator
  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data: {
      conversationId: string;
      userId: string;
      username: string;
      isTyping: boolean;
    }) => {
      if (data.conversationId === activeId && data.userId !== myUserId) {
        setIsOtherUserTyping(data.isTyping);

        if (otherUserTypingTimerRef.current) {
          clearTimeout(otherUserTypingTimerRef.current);
        }

        if (data.isTyping) {
          otherUserTypingTimerRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, 3000);
        }
      }
    };

    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('user_typing', handleUserTyping);
      if (otherUserTypingTimerRef.current) {
        clearTimeout(otherUserTypingTimerRef.current);
      }
    };
  }, [socket, activeId, myUserId]);

  // 9. Real-time Socket Event: messages read receipts
  useEffect(() => {
    if (!socket) return;

    const handleMessagesRead = (data: { conversationId: string; readBy: string }) => {
      if (data.conversationId === activeId) {
        setMessages((prev) =>
          prev.map((m) => {
            const isMine = isMyMessage(m);
            return isMine ? { ...m, read: true } : m;
          })
        );
      }
    };

    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, activeId, myUserId]);

  // Auto-scroll when messages update
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // 10. Handle textarea typing with debounced socket typing indicator
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    if (activeId) {
      sendTyping(activeId, true);

      if (myTypingTimerRef.current) {
        clearTimeout(myTypingTimerRef.current);
      }

      myTypingTimerRef.current = setTimeout(() => {
        sendTyping(activeId, false);
      }, 2000);
    }
  };

  // 11. Send message handler via Socket.IO (with optimistic update)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = messageText.trim();
    if (!text || !activeId || sending) return;

    // Reset typing status immediately upon sending
    if (myTypingTimerRef.current) clearTimeout(myTypingTimerRef.current);
    sendTyping(activeId, false);

    setMessageText('');
    setSending(true);

    const senderId = myUserId || 'me';
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      _id: tempId,
      conversationId: activeId,
      sender: {
        id: senderId,
        _id: senderId,
        name: authUser?.name || 'Me',
        username: authUser?.username || 'me',
        avatar: authUser?.avatar,
      },
      content: text,
      read: false,
      isMine: true,
      createdAt: new Date().toISOString(),
    };

    // Optimistically add to UI
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom(true);

    try {
      // Send via Socket.IO (automatic fallback to REST if disconnected)
      const sentMsg = await socketSendMessage(activeId, text);

      // Replace optimistic message with server-confirmed message
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...sentMsg, isMine: true } : m))
      );

      // Update active conversation in list immediately
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === activeId || c._id === activeId);
        if (index !== -1) {
          const conv = prev[index];
          const updated = {
            ...conv,
            lastMessage: {
              content: text,
              senderId,
              createdAt: sentMsg.createdAt,
            },
            updatedAt: sentMsg.createdAt,
          };
          return [updated, ...prev.filter((_, i) => i !== index)];
        }
        return prev;
      });
    } catch (err: any) {
      console.error('[Chats] Failed to send message:', err);
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

  // 12. New Chat modal user search with debounce
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
          {/* Top Header with live socket indicator */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
            <div className="flex items-center gap-2.5">
              <MessageSquareIcon size={19} className="text-gold" />
              <h1 className="text-base font-semibold text-fg">Messages</h1>
              <span
                title={isConnected ? 'Real-time connected' : 'Connecting real-time...'}
                className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-fg-subtle ring-1 ring-inset ring-line"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isConnected ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]' : 'bg-amber-500'
                  }`}
                />
                {isConnected ? 'Live' : 'Connecting'}
              </span>
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
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-fg group-hover:text-gold transition-colors">
                          {otherUser.name}
                        </h2>
                        {isConnected ? (
                          <span
                            title="Connected via WebSocket"
                            className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                          />
                        ) : (
                          <span
                            title="Reconnecting..."
                            className="h-1.5 w-1.5 rounded-full bg-amber-500"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-fg-subtle">@{otherUser.username}</p>
                    </div>
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-fg-subtle">
                    {isConnected ? (
                      <>
                        <WifiIcon size={13} className="text-emerald-500" />
                        <span>Live chat</span>
                      </>
                    ) : (
                      <>
                        <WifiOffIcon size={13} className="text-amber-500 animate-pulse" />
                        <span>Reconnecting</span>
                      </>
                    )}
                  </span>
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

                    const isMine = isMyMessage(msg);

                    return (
                      <React.Fragment key={msg.id || msg._id || `msg-${index}`}>
                        {showDateHeader && (
                          <div className="my-4 flex items-center justify-center">
                            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-fg-subtle ring-1 ring-inset ring-line">
                              {formatHeaderDate(msg.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-end gap-2 ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isMine && (
                            <Avatar
                              user={
                                formatUserForUi(
                                  msg.sender && typeof msg.sender === 'object' && (msg.sender.name || msg.sender.avatar)
                                    ? (msg.sender as any)
                                    : otherUser || undefined
                                ) as any
                              }
                              size="xs"
                              className="mb-1"
                            />
                          )}

                          <div
                            className={`group relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm transition-all ${
                              isMine
                                ? 'rounded-tr-xs bg-gradient-to-br from-amber-600/35 to-gold/25 text-fg ring-1 ring-gold/40'
                                : 'rounded-tl-xs bg-surface-raised/90 text-fg ring-1 ring-line'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <div
                              className={`mt-1 flex items-center gap-1 text-[10px] ${
                                isMine ? 'justify-end text-gold/80' : 'text-fg-subtle'
                              }`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isMine && (
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

              {/* Message Input Box with Typing Indicator */}
              <div className="border-t border-line bg-surface/70 p-3 sm:p-4 backdrop-blur-md">
                {/* Live typing indicator from other user */}
                {isOtherUserTyping && (
                  <div className="mb-2 flex items-center gap-2 px-1 text-xs text-gold animate-fadeIn">
                    <span className="flex gap-1 items-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse delay-75" />
                      <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse delay-150" />
                    </span>
                    <span className="italic">{otherUser.name} is typing...</span>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={messageText}
                    onChange={handleMessageInputChange}
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
