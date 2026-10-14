import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMessage {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageDocument extends IMessage, Document {}

const messageSchema = new Schema<IMessageDocument>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content cannot be empty'],
      trim: true,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message: Model<IMessageDocument> = mongoose.model<IMessageDocument>('Message', messageSchema);
export default Message;
