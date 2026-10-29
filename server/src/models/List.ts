import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IListFilm {
  filmId: string;
  title: string;
  posterPath?: string;
  year?: number;
  addedAt: Date;
  addedBy?: mongoose.Types.ObjectId;
}

export interface IListMember {
  user: mongoose.Types.ObjectId;
  role: 'owner' | 'editor';
  addedAt: Date;
}

export interface IList {
  name: string;
  description?: string;
  coverImage?: string;
  owner: mongoose.Types.ObjectId;
  isCollaborative: boolean;
  members: IListMember[];
  films: IListFilm[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IListDocument extends IList, Document {}

const listFilmSchema = new Schema<IListFilm>(
  {
    filmId: {
      type: String,
      required: [true, 'Film ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Film title is required'],
      trim: true,
    },
    posterPath: {
      type: String,
      default: '',
    },
    year: {
      type: Number,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const listMemberSchema = new Schema<IListMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'editor'],
      default: 'editor',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const listSchema = new Schema<IListDocument>(
  {
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      maxlength: [120, 'List name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    isCollaborative: {
      type: Boolean,
      default: false,
    },
    members: {
      type: [listMemberSchema],
      default: [],
    },
    films: {
      type: [listFilmSchema],
      default: [],
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

listSchema.index({ owner: 1, createdAt: -1 });
// Allow editors to query lists they are members of
listSchema.index({ 'members.user': 1 });

export const List: Model<IListDocument> = mongoose.model<IListDocument>('List', listSchema);
export default List;
