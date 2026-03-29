import mongoose from 'mongoose';
import { UserStatus } from '@chat-app/shared';

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.OFFLINE,
  },
  bio: {
    type: String,
    default: '',
  }
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

export const Profile = mongoose.model('Profile', profileSchema);
