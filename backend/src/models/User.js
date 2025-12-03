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
  // --- NEW FIELDS ---
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(255), // URL to avatar image
    allowNull: true
  },
  role: { 
    type: DataTypes.ENUM('user', 'admin'), 
    defaultValue: 'user' 
  },
  plan: { 
    type: DataTypes.ENUM('free', 'pro'), 
    defaultValue: 'free' 
  },
  // Simple usage tracking (reset this via cron job monthly if needed)
  usageCount: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  }
}, {
  timestamps: true, // Changed to true to track createdAt/updatedAt
  tableName: 'user'
});

export default User;