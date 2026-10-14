import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILastMessage {
  content: string;
  senderId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IConversation {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: ILastMessage | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IConversationDocument extends IConversation, Document {}

const conversationSchema = new Schema<IConversationDocument>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: {
        content: { type: String, trim: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date },
      },
      default: null,
      _id: false,
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

// Index to quickly search conversations for a user
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

export const Conversation: Model<IConversationDocument> = mongoose.model<IConversationDocument>(
  'Conversation',
  conversationSchema
);
export default Conversation;
