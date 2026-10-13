import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDiaryEntry {
  userId: mongoose.Types.ObjectId;
  filmId: string;
  date: string;
  rating?: number;
  review?: string;
  liked: boolean;
  rewatch: boolean;
  film?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDiaryEntryDocument extends IDiaryEntry, Document {}

const diaryEntrySchema = new Schema<IDiaryEntryDocument>(
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
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    rating: {
      type: Number,
      min: [0.5, 'Rating must be at least 0.5'],
      max: [5, 'Rating cannot exceed 5'],
    },
    review: {
      type: String,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
      trim: true,
    },
    liked: {
      type: Boolean,
      default: false,
    },
    rewatch: {
      type: Boolean,
      default: false,
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

// Compound index for sorting user's diary chronologically
diaryEntrySchema.index({ userId: 1, date: -1 });

export const DiaryEntry: Model<IDiaryEntryDocument> = mongoose.model<IDiaryEntryDocument>(
  'DiaryEntry',
  diaryEntrySchema
);
export default DiaryEntry;
