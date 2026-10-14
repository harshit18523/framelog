import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFollow {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFollowDocument extends IFollow, Document {}

const followSchema = new Schema<IFollowDocument>(
  {
    followerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follower ID is required'],
      index: true,
    },
    followingId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Following ID is required'],
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

// Prevent duplicate follows
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const Follow: Model<IFollowDocument> = mongoose.model<IFollowDocument>('Follow', followSchema);
export default Follow;
