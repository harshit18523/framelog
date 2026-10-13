import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWatchlistItem {
  userId: mongoose.Types.ObjectId;
  filmId: string;
  film?: Record<string, unknown>;
  addedAt: Date;
}

export interface IWatchlistItemDocument extends IWatchlistItem, Document {}

const watchlistItemSchema = new Schema<IWatchlistItemDocument>(
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
    addedAt: {
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

// Compound unique index: A film can only be in a user's watchlist once
watchlistItemSchema.index({ userId: 1, filmId: 1 }, { unique: true });

export const WatchlistItem: Model<IWatchlistItemDocument> = mongoose.model<IWatchlistItemDocument>(
  'WatchlistItem',
  watchlistItemSchema
);
export default WatchlistItem;
