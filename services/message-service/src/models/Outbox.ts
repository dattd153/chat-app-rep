import mongoose from 'mongoose';

const outboxSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true, // e.g., 'MESSAGE_CREATED'
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending',
  },
  retryCount: {
    type: Number,
    default: 0,
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

// Index for polling
outboxSchema.index({ status: 1, createdAt: 1 });

export const Outbox = mongoose.model('Outbox', outboxSchema);
