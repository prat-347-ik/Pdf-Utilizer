import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  // --- NEW FIELD ---
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // ... (Keep your profile fields from previous steps if you added them)
  fullName: { type: DataTypes.STRING(100), allowNull: true },
  avatar: { type: DataTypes.STRING(255), allowNull: true },
  role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  plan: { type: DataTypes.ENUM('free', 'pro'), defaultValue: 'free' },
}, {
  timestamps: true,
  tableName: 'user'
});

export default User;