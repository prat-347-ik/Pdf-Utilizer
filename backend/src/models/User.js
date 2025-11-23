import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; // Note: In ES modules, you must include .js extension

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
  }
}, {
  timestamps: false,
  tableName: 'user'
});

export default User;