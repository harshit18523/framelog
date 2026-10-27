import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReviewComment {
  reviewId: mongoose.Types.ObjectId;
  filmId: string;
  userId: mongoose.Types.ObjectId;
  content: string;
  parentId?: mongoose.Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReviewCommentDocument extends IReviewComment, Document {}

const reviewCommentSchema = new Schema<IReviewCommentDocument>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'DiaryEntry',
      required: [true, 'Review ID is required'],
      index: true,
    },
    filmId: {
      type: String,
      required: [true, 'Film ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'ReviewComment',
      default: null,
      index: true,
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

// Index to retrieve comments for a review efficiently in chronological order
reviewCommentSchema.index({ reviewId: 1, createdAt: 1 });

export const ReviewComment: Model<IReviewCommentDocument> = mongoose.model<IReviewCommentDocument>(
  'ReviewComment',
  reviewCommentSchema
);
export default ReviewComment;
