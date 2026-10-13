import apiClient from './client';
import type { Film } from '../types/film';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface SearchFilmsResult {
  results: Film[];
  totalResults: number;
  page: number;
}

export interface FilmListResult {
  results: Film[];
  page?: number;
}

export const searchFilmsApi = async (
  query: string,
  genre?: string | null,
  page = 1
): Promise<SearchFilmsResult> => {
  const params: Record<string, string | number> = { page };
  if (query) params.query = query;
  if (genre) params.genre = genre;

  const res = await apiClient.get<ApiResponse<SearchFilmsResult>>('/films/search', { params });
  return res.data.data;
};

export const getPopularFilmsApi = async (page = 1): Promise<FilmListResult> => {
  const res = await apiClient.get<ApiResponse<FilmListResult>>('/films/popular', {
    params: { page },
  });
  return res.data.data;
};

export const getTrendingFilmsApi = async (timeWindow: 'day' | 'week' = 'week'): Promise<FilmListResult> => {
  const res = await apiClient.get<ApiResponse<FilmListResult>>('/films/trending', {
    params: { timeWindow },
  });
  return res.data.data;
};

export const getDiscoverFilmsApi = async (options: {
  genre?: string | null;
  sortBy?: string;
  page?: number;
} = {}): Promise<FilmListResult> => {
  const params: Record<string, string | number> = {};
  if (options.genre) params.genre = options.genre;
  if (options.sortBy) params.sortBy = options.sortBy;
  if (options.page) params.page = options.page;

  const res = await apiClient.get<ApiResponse<FilmListResult>>('/films/discover', { params });
  return res.data.data;
};

export const getFilmByIdApi = async (id: string): Promise<Film> => {
  const res = await apiClient.get<ApiResponse<Film>>(`/films/${id}`);
  return res.data.data;
};
