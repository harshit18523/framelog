import apiClient from './client';
import type { ApiResponse } from '../types/auth';

export interface ChatUser {
  id: string;
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export interface ConversationItem {
  id: string;
  _id: string;
  participants: ChatUser[];
  otherUser: ChatUser | null;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  _id: string;
  conversationId: string;
  sender?: {
    id?: string;
    _id?: string;
    name?: string;
    username?: string;
    avatar?: string;
  } | string;
  senderId?: string | { id?: string; _id?: string };
  content: string;
  read: boolean;
  isMine?: boolean;
  createdAt: string;
}

export interface ConversationDetailResponse {
  conversation: {
    id: string;
    _id: string;
    participants: ChatUser[];
    otherUser: ChatUser | null;
    updatedAt: string;
  };
  messages: ChatMessage[];
}

/**
 * List all conversations for the authenticated user
 */
export const getConversationsApi = async (): Promise<ConversationItem[]> => {
  const res = await apiClient.get<ApiResponse<ConversationItem[]>>('/chats');
  return res.data.data || [];
};

/**
 * Create a new conversation or get an existing one with recipientId
 */
export const getOrCreateConversationApi = async (recipientId: string): Promise<ConversationItem> => {
  const res = await apiClient.post<ApiResponse<ConversationItem>>('/chats', { recipientId });
  const data = res.data?.data || (res.data as unknown as ConversationItem);
  if (!data) {
    throw new Error(res.data?.message || 'Failed to start conversation');
  }
  return data;
};

/**
 * Get messages of a conversation
 */
export const getConversationMessagesApi = async (
  conversationId: string
): Promise<ConversationDetailResponse> => {
  const res = await apiClient.get<ApiResponse<ConversationDetailResponse>>(`/chats/${conversationId}`);
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to fetch messages');
  }
  return res.data.data;
};

/**
 * Send a message in a conversation
 */
export const sendMessageApi = async (
  conversationId: string,
  content: string
): Promise<ChatMessage> => {
  const res = await apiClient.post<ApiResponse<ChatMessage>>(`/chats/${conversationId}/messages`, {
    content,
  });
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to send message');
  }
  return res.data.data;
};

/**
 * Mark messages in a conversation as read
 */
export const markConversationReadApi = async (conversationId: string): Promise<void> => {
  await apiClient.put(`/chats/${conversationId}/read`);
};
