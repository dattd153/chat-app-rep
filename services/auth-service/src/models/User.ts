import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  refreshTokens: [String], // Array of valid refresh tokens for this user
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete (ret as any).password;
      delete (ret as any).__v;
      delete (ret as any).refreshTokens;
    }
  }
});

userSchema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await bcrypt.hash(this.get('password'), 10);
    this.set('password', hashed);
  }
  done();
});

export const User = mongoose.model('User', userSchema);
