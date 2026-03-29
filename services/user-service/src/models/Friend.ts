import mongoose from 'mongoose';
import { FriendStatus } from '@chat-app/shared';

const friendSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  friendId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(FriendStatus),
    default: FriendStatus.PENDING,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete (ret as any).__v;
    }
  }
});

// Compound index to ensure uniqueness of relationship
friendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const Friend = mongoose.model('Friend', friendSchema);
