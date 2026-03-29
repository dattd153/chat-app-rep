import mongoose from 'mongoose';
import { ChatRole } from '@chat-app/shared';

const chatMemberSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  userId: {
    type: String, // x-user-id from gateway
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(ChatRole),
    default: ChatRole.MEMBER,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      (ret as any).id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
    }
  }
});

// Compound index for member lookup
chatMemberSchema.index({ userId: 1, chatId: 1 }, { unique: true });
chatMemberSchema.index({ chatId: 1 });

export const ChatMember = mongoose.model('ChatMember', chatMemberSchema);
