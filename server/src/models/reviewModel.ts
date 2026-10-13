import { Document, Schema, Types, model } from "mongoose";
import type { Iuser } from "./userModel.js";

export interface Ireview extends Document {
  user: Types.ObjectId | Iuser;
  tmdbId: string;
  movieTitle: string; // Storing title locally prevents an extra TMDB API call on profile pages
  posterPath: string; // Same for the poster
  rating: number; // 0.5 to 5.0
  text: string;
  watchedOn: Date;
  isLiked: boolean;
}

const reviewSchema = new Schema<Ireview>({
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
  rating: {
    type: Number,
    required: true,
    min: 0.5,
    max: 5
  },
  text: {
    type: String,
    required: true
  },
  watchedOn: {
    type: Date,
    default: Date.now
  },
  isLiked: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Ensure a user can only leave one review per movie
reviewSchema.index({
  user: 1,
  tmdbId: 1
}, { unique: true });

export default model<Ireview>("Review", reviewSchema);
