import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { ChatMessage } from '../api/chats.api';
import { sendMessageApi } from '../api/chats.api';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<ChatMessage>;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  markAsRead: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  // Initialize and manage Socket connection based on auth status
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = getSocketUrl();
    const socketInstance = io(socketUrl, {
      auth: {
        token: accessToken,
      },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ [Socket] Connected successfully. Socket ID:', socketInstance.id);
      setIsConnected(true);

      // Re-join active room if user was in one before reconnect
      if (currentRoomRef.current) {
        socketInstance.emit('join_conversation', currentRoomRef.current);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 [Socket] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('⚠️ [Socket] Connection error:', error.message);
      setIsConnected(false);
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, accessToken]);

  const joinConversation = useCallback((conversationId: string) => {
    currentRoomRef.current = conversationId;
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_conversation', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    if (currentRoomRef.current === conversationId) {
      currentRoomRef.current = null;
    }
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave_conversation', conversationId);
    }
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string): Promise<ChatMessage> => {
      const activeSocket = socketRef.current;
      if (activeSocket && activeSocket.connected) {
        return new Promise((resolve, reject) => {
          activeSocket.emit(
            'send_message',
            { conversationId, content },
            (response: { success: boolean; data?: ChatMessage; error?: string }) => {
              if (response?.success && response.data) {
                resolve(response.data);
              } else {
                reject(new Error(response?.error || 'Failed to send message over socket'));
              }
            }
          );
        });
      } else {
        // Graceful fallback to REST API if socket is temporarily disconnected
        return await sendMessageApi(conversationId, content);
      }
    },
    []
  );

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { conversationId, isTyping });
    }
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('mark_read', { conversationId });
    }
  }, []);

  const value: SocketContextValue = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    markAsRead,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export default SocketContext;
