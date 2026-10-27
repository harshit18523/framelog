import apiClient from './client';
import type { ApiResponse } from '../types/auth';

export interface ReviewUser {
  id: string;
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
}

export interface FriendReviewItem {
  id: string;
  _id: string;
  filmId: string;
  user: ReviewUser;
  rating?: number;
  review: string;
  liked: boolean;
  rewatch: boolean;
  date: string;
  commentsCount: number;
  createdAt: string;
}

export interface ReviewCommentItem {
  id: string;
  _id: string;
  reviewId: string;
  filmId: string;
  user: ReviewUser;
  content: string;
  parentId?: string | null;
  isMine?: boolean;
  createdAt: string;
}

/**
 * Fetch reviews from people the current user follows for a specific film
 */
export const getFriendsFilmReviewsApi = async (filmId: string): Promise<FriendReviewItem[]> => {
  const res = await apiClient.get<ApiResponse<FriendReviewItem[]>>(`/reviews/films/${filmId}/friends`);
  return res.data.data || [];
};

/**
 * Fetch comments for a review
 */
export const getReviewCommentsApi = async (reviewId: string): Promise<ReviewCommentItem[]> => {
  const res = await apiClient.get<ApiResponse<ReviewCommentItem[]>>(`/reviews/${reviewId}/comments`);
  return res.data.data || [];
};

/**
 * Add a comment or reply to a review
 */
export const addReviewCommentApi = async (
  reviewId: string,
  content: string,
  parentId?: string
): Promise<ReviewCommentItem> => {
  const res = await apiClient.post<ApiResponse<ReviewCommentItem>>(`/reviews/${reviewId}/comments`, {
    content,
    parentId,
  });
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to post comment');
  }
  return res.data.data;
};

/**
 * Delete a comment on a review
 */
export const deleteReviewCommentApi = async (commentId: string): Promise<void> => {
  await apiClient.delete<ApiResponse<{ success: boolean }>>(`/reviews/comments/${commentId}`);
};
