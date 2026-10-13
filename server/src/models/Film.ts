import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICredit {
  name: string;
  role: string;
}

export interface IFilm {
  id: string; // TMDB ID as string or slug
  tmdbId?: number;
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
  cast: ICredit[];
  crew: ICredit[];
  cachedAt?: Date;
}

export interface IFilmDocument extends Document, Omit<IFilm, 'id'> {
  id: string;
}

const creditSchema = new Schema<ICredit>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
  },
  { _id: false }
);

const filmSchema = new Schema<IFilmDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tmdbId: {
      type: Number,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    year: {
      type: Number,
      default: 0,
    },
    director: {
      type: String,
      default: 'Unknown',
    },
    runtime: {
      type: Number,
      default: 0,
    },
    genres: {
      type: [String],
      default: [],
    },
    poster: {
      type: String,
      default: '',
    },
    backdrop: {
      type: String,
      default: '',
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    watchedCount: {
      type: String,
      default: '0',
    },
    fansCount: {
      type: String,
      default: '0',
    },
    tagline: {
      type: String,
      default: '',
    },
    synopsis: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: '',
    },
    studio: {
      type: String,
      default: '',
    },
    cast: {
      type: [creditSchema],
      default: [],
    },
    crew: {
      type: [creditSchema],
      default: [],
    },
    cachedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as Record<string, unknown>;
        delete obj._id;
        delete obj.__v;
        return obj;
      },
    },
  }
);

export const Film: Model<IFilmDocument> = mongoose.model<IFilmDocument>('Film', filmSchema);
export default Film;
