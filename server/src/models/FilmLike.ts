import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFilmLike {
  userId: mongoose.Types.ObjectId;
  filmId: string;
  createdAt: Date;
}

export interface IFilmLikeDocument extends IFilmLike, Document {}

const filmLikeSchema = new Schema<IFilmLikeDocument>(
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
    createdAt: {
      type: Date,
      default: Date.now,
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

// Compound unique index: A user can only like a film once
filmLikeSchema.index({ userId: 1, filmId: 1 }, { unique: true });

export const FilmLike: Model<IFilmLikeDocument> = mongoose.model<IFilmLikeDocument>(
  'FilmLike',
  filmLikeSchema
);
export default FilmLike;
