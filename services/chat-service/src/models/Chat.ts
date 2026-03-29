import mongoose from 'mongoose';
import { ChatType } from '@chat-app/shared';

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(ChatType),
    required: true,
  },
  name: {
    type: String,
    required: function(this: any) {
      return this.type === ChatType.GROUP;
    },
  },
  avatar: {
    type: String,
  },
  lastMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
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

// Index for performance
chatSchema.index({ createdAt: -1 });

export const Chat = mongoose.model('Chat', chatSchema);
