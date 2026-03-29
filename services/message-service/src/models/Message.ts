import mongoose from 'mongoose';
import { MessageType, MessageStatus } from '@chat-app/shared';

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat', // Reference to Chat in another DB (or same if shared)
    required: true,
  },
  senderId: {
    type: String, // x-user-id from gateway
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: Object.values(MessageType),
    default: MessageType.TEXT,
  },
  status: {
    type: String,
    enum: Object.values(MessageStatus),
    default: MessageStatus.SENT,
  },
  clientMessageId: {
    type: String, // UUID from client for deduplication
    required: true,
    unique: true,
  },
  seenAt: {
    type: Date,
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      (ret as any).id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
    }
  }
});

// Indexes for performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ clientMessageId: 1 }, { unique: true });

export const Message = mongoose.model('Message', messageSchema);
