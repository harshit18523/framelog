import apiClient from './client';
import type { ApiResponse } from './library.api';
import type {
  UserList,
  CreateListPayload,
  UpdateListPayload,
  AddFilmPayload,
  InviteMemberPayload,
  ListMember,
  SearchUserResult,
} from '../types/list';

/**
 * Get all lists belonging to or shared with the authenticated user
 */
export const getListsApi = async (): Promise<UserList[]> => {
  const res = await apiClient.get<ApiResponse<UserList[]>>('/lists');
  return res.data.data || [];
};

/**
 * Get a single list by ID
 */
export const getListByIdApi = async (id: string): Promise<UserList> => {
  const res = await apiClient.get<ApiResponse<UserList>>(`/lists/${id}`);
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to fetch list');
  }
  return res.data.data;
};

/**
 * Create a new list
 */
export const createListApi = async (payload: CreateListPayload): Promise<UserList> => {
  const res = await apiClient.post<ApiResponse<UserList>>('/lists', payload);
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to create list');
  }
  return res.data.data;
};

/**
 * Update a list's details
 */
export const updateListApi = async (
  id: string,
  payload: UpdateListPayload
): Promise<UserList> => {
  const res = await apiClient.put<ApiResponse<UserList>>(`/lists/${id}`, payload);
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to update list');
  }
  return res.data.data;
};

/**
 * Delete a list by ID
 */
export const deleteListApi = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/lists/${id}`);
};

/**
 * Add a film to a list
 */
export const addFilmToListApi = async (
  listId: string,
  film: AddFilmPayload
): Promise<UserList> => {
  const res = await apiClient.post<ApiResponse<UserList>>(`/lists/${listId}/films`, film);
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to add film to list');
  }
  return res.data.data;
};

/**
 * Remove a film from a list
 */
export const removeFilmFromListApi = async (
  listId: string,
  filmId: string
): Promise<UserList> => {
  const res = await apiClient.delete<ApiResponse<UserList>>(
    `/lists/${listId}/films/${filmId}`
  );
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to remove film from list');
  }
  return res.data.data;
};

// ─── Member Management ────────────────────────────────────────────────────────

/**
 * Get all members of a list
 */
export const getListMembersApi = async (listId: string): Promise<ListMember[]> => {
  const res = await apiClient.get<ApiResponse<ListMember[]>>(`/lists/${listId}/members`);
  return res.data.data || [];
};

/**
 * Invite a user to a collaborative list
 */
export const addMemberApi = async (
  listId: string,
  payload: InviteMemberPayload
): Promise<UserList> => {
  const res = await apiClient.post<ApiResponse<UserList>>(
    `/lists/${listId}/members`,
    payload
  );
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to add member');
  }
  return res.data.data;
};

/**
 * Remove a member from a collaborative list
 */
export const removeMemberApi = async (
  listId: string,
  memberId: string
): Promise<UserList> => {
  const res = await apiClient.delete<ApiResponse<UserList>>(
    `/lists/${listId}/members/${memberId}`
  );
  if (!res.data.data) {
    throw new Error(res.data.message || 'Failed to remove member');
  }
  return res.data.data;
};

/**
 * Search for users to invite to a collaborative list
 */
export const searchUsersToInviteApi = async (
  listId: string,
  query: string
): Promise<SearchUserResult[]> => {
  const res = await apiClient.get<ApiResponse<SearchUserResult[]>>(
    `/lists/${listId}/members/search`,
    { params: { q: query } }
  );
  return res.data.data || [];
};
