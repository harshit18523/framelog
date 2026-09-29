export type Credit = {
  name: string;
  role: string;
};

export type Film = {
  id: string;
  title: string;
  year: number;
  director: string;
  runtime: number;
  genres: string[];
  poster: string;
  backdrop?: string;
  averageRating: number;
  watchedCount: string;
  fansCount: string;
  tagline: string;
  synopsis: string;
  country: string;
  language: string;
  studio: string;
  cast: Credit[];
  crew: Credit[];
};

export type DiaryEntry = {
  id: string;
  filmId: string;
  date: string;
  rating?: number;
  review?: string;
  liked: boolean;
  rewatch: boolean;
};