export interface ListFilm {
  filmId: string;
  title: string;
  posterPath?: string;
  year?: number;
  addedAt: string;
  addedBy?: string | ListMemberUser;
}

export interface ListMemberUser {
  _id: string;
  username: string;
  profilePicture?: string;
  avatar?: string;
}

export interface ListMember {
  user: ListMemberUser;
  role: 'owner' | 'editor';
  addedAt: string;
}

export interface UserList {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  coverImage?: string;
  owner: string | ListMemberUser;
  isCollaborative: boolean;
  members: ListMember[];
  films: ListFilm[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateListPayload {
  name: string;
  description?: string;
  coverImage?: string;
  isCollaborative?: boolean;
}

export interface UpdateListPayload {
  name?: string;
  description?: string;
  coverImage?: string;
  isCollaborative?: boolean;
}

export interface AddFilmPayload {
  filmId: string;
  title?: string;
  posterPath?: string;
  year?: number;
}

export interface InviteMemberPayload {
  username: string;
  role?: 'editor';
}

export interface SearchUserResult {
  _id: string;
  username: string;
  profilePicture?: string;
  avatar?: string;
}

/** Resolves the owner id string regardless of whether it's populated */
export const getOwnerId = (list: UserList): string => {
  if (typeof list.owner === 'string') return list.owner;
  return list.owner._id;
};

/** Resolves the list id (handles both id and _id) */
export const getListId = (list: UserList): string => list.id || list._id || '';
