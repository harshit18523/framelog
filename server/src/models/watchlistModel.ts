import { Document, Schema, Types, model } from "mongoose";

import type { Iuser } from "./userModel.js";

export interface Iwatchlist extends Document {
  user: Types.ObjectId | Iuser;
  tmdbId: string;
  movieTitle: string;
  posterPath: string;
}

const watchlistSchema = new Schema<Iwatchlist>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tmdbId: {
    type: String,
    required: true
  },
  movieTitle: {
    type: String,
    required: true
  },
  posterPath: {
    type: String,
    required: true
  },
}, { timestamps: true });

// A user can't add the same movie to their watchlist twice
watchlistSchema.index({
  user: 1,
  tmdbId: 1
}, { unique: true });

export default model<Iwatchlist>("Watchlist", watchlistSchema);
