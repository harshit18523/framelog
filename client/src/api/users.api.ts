import apiClient from './client';
import type { ApiResponse } from '../types/auth';

export interface UserSearchResult {
  id: string;
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
  isFollowing: boolean;
  isSelf: boolean;
}

export interface UserProfileData {
  id: string;
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
  followersCount: number;
  followingCount: number;
  loggedFilmsCount: number;
  isFollowing: boolean;
  isSelf: boolean;
}

export interface FollowToggleResult {
  isFollowing: boolean;
  followersCount: number;
}

export interface SimpleUser {
  id: string;
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

/**
 * Search users by name or username
 */
export const searchUsersApi = async (query: string): Promise<UserSearchResult[]> => {
  const res = await apiClient.get<ApiResponse<UserSearchResult[]>>('/users/search', {
    params: { q: query },
  });
  return res.data.data || [];
};

/**
 * Get profile data for a specific user (by ID or username)
 */
export const getUserProfileApi = async (idOrUsername: string): Promise<UserProfileData> => {
  const res = await apiClient.get<ApiResponse<UserProfileData>>(`/users/${idOrUsername}`);
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to fetch user profile');
  }
  return res.data.data;
};

/**
 * Follow a user
 */
export const followUserApi = async (userId: string): Promise<FollowToggleResult> => {
  const res = await apiClient.post<ApiResponse<FollowToggleResult>>(`/users/${userId}/follow`);
  return res.data.data || { isFollowing: true, followersCount: 0 };
};

/**
 * Unfollow a user
 */
export const unfollowUserApi = async (userId: string): Promise<FollowToggleResult> => {
  const res = await apiClient.delete<ApiResponse<FollowToggleResult>>(`/users/${userId}/unfollow`);
  return res.data.data || { isFollowing: false, followersCount: 0 };
};

/**
 * Get followers list
 */
export const getFollowersApi = async (userId: string): Promise<SimpleUser[]> => {
  const res = await apiClient.get<ApiResponse<SimpleUser[]>>(`/users/${userId}/followers`);
  return res.data.data || [];
};

/**
 * Get following list
 */
export const getFollowingApi = async (userId: string): Promise<SimpleUser[]> => {
  const res = await apiClient.get<ApiResponse<SimpleUser[]>>(`/users/${userId}/following`);
  return res.data.data || [];
};

export interface FeedResponse {
  items: import('../types/social').Activity[];
  followingCount: number;
}

/**
 * Get friends activity feed
 */
export const getFeedApi = async (): Promise<FeedResponse> => {
  const res = await apiClient.get<ApiResponse<FeedResponse>>('/feed');
  return res.data.data || { items: [], followingCount: 0 };
};
