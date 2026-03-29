import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type: String, // Reference to auth user id
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline',
  },
  lastSeen: {
    type: Date,
    default: Date.now,
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

// Full-text search index
profileSchema.index({ name: 'text', email: 'text' });

export const Profile = mongoose.model('Profile', profileSchema);
