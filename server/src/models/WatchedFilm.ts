import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWatchedFilm {
  userId: mongoose.Types.ObjectId;
  filmId: string;
  film?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWatchedFilmDocument extends IWatchedFilm, Document {}

const watchedFilmSchema = new Schema<IWatchedFilmDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    filmId: {
      type: String,
      required: [true, 'Film ID is required'],
      index: true,
    },
    film: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as Record<string, unknown>;
        obj.id = obj._id?.toString();
        delete obj._id;
        delete obj.__v;
        return obj;
      },
    },
  }
);

// A user can only mark a film as watched once
watchedFilmSchema.index({ userId: 1, filmId: 1 }, { unique: true });

export const WatchedFilm: Model<IWatchedFilmDocument> = mongoose.model<IWatchedFilmDocument>(
  'WatchedFilm',
  watchedFilmSchema
);
export default WatchedFilm;
