import type { Film } from './film';

export type User = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  tone: string;
  avatar?: string;
  bio?: string;
  location?: string;
};

export type ActivityKind = 'review' | 'watched' | 'list';

export type Activity = {
  id: string;
  userId: string;
  user?: Partial<User> & { username?: string };
  film?: Film;
  kind: ActivityKind;
  filmId?: string;
  rating?: number;
  text?: string;
  rewatch?: boolean;
  list?: {
    title: string;
    filmIds: string[];
    filmCount: number;
  };
  time: string;
  likes: number;
  comments: number;
  createdAt?: string;
};

export type Review = {
  id: string;
  filmId: string;
  userId: string;
  rating: number;
  text: string;
  likes: number;
  date: string;
};

export type FilmList = {
  id: string;
  title: string;
  description: string;
  filmIds: string[];
  filmCount: number;
  likes: number;
};

export type Notification = {
  id: string;
  userId: string;
  text: string;
  filmId?: string;
  time: string;
  unread: boolean;
};