import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 80
  },
  email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 120
  },
  password: {
    type: String,
    required: true,
    maxlength: 200
  },
  refreshToken: {
    type: String,
    default: null
  },
  fullName: {
    type: String,
    maxlength: 100
  },
  avatar: {
    type: String,
    maxlength: 255
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Mongoose models do not need manual sync()
const User = mongoose.model('User', UserSchema);

export default User;