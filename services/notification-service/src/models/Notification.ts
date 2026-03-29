import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['message', 'friend_request', 'friend_accepted'],
    required: true,
  },
  refId: {
    type: String, // messageId, userId, or requestId
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for user lookup
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
