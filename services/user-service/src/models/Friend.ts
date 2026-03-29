import mongoose from 'mongoose';
import { FriendStatus } from '@chat-app/shared';

const friendSchema = new mongoose.Schema({
  userId: {
    type: String, // x-user-id from gateway
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

// Index for easy lookup
friendSchema.index({ userId: 1, friendId: 1 }, { unique: true });
friendSchema.index({ userId: 1, status: 1 });

export const Friend = mongoose.model('Friend', friendSchema);
