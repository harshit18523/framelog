import apiClient from './client';
import type { DiaryEntry, Film } from '../types/film';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface WatchlistResponse {
  items: Array<{ id: string; filmId: string; film?: Partial<Film>; addedAt: string }>;
  filmIds: string[];
}

export interface LikesResponse {
  filmIds: string[];
}

// Diary API endpoints
export const getDiaryEntriesApi = async (): Promise<DiaryEntry[]> => {
  const res = await apiClient.get<ApiResponse<DiaryEntry[]>>('/diary');
  return res.data.data;
};

export const createDiaryEntryApi = async (payload: {
  filmId: string;
  date: string;
  rating?: number;
  review?: string;
  liked?: boolean;
  rewatch?: boolean;
  film?: Partial<Film>;
}): Promise<DiaryEntry> => {
  const res = await apiClient.post<ApiResponse<DiaryEntry>>('/diary', payload);
  return res.data.data;
};

export const updateDiaryEntryApi = async (
  id: string,
  payload: Partial<{
    date: string;
    rating?: number;
    review?: string;
    liked: boolean;
    rewatch: boolean;
  }>
): Promise<DiaryEntry> => {
  const res = await apiClient.put<ApiResponse<DiaryEntry>>(`/diary/${id}`, payload);
  return res.data.data;
};

export const deleteDiaryEntryApi = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/diary/${id}`);
};

// Watchlist API endpoints
export const getWatchlistApi = async (): Promise<WatchlistResponse> => {
  const res = await apiClient.get<ApiResponse<WatchlistResponse>>('/watchlist');
  return res.data.data;
};

export const addToWatchlistApi = async (filmId: string, film?: Partial<Film>): Promise<void> => {
  await apiClient.post<ApiResponse<unknown>>('/watchlist', { filmId, film });
};

export const removeFromWatchlistApi = async (filmId: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/watchlist/${filmId}`);
};

// Likes API endpoints
export const getLikesApi = async (): Promise<LikesResponse> => {
  const res = await apiClient.get<ApiResponse<LikesResponse>>('/likes');
  return res.data.data;
};

export const likeFilmApi = async (filmId: string): Promise<void> => {
  await apiClient.post<ApiResponse<unknown>>('/likes', { filmId });
};

export const unlikeFilmApi = async (filmId: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/likes/${filmId}`);
};
