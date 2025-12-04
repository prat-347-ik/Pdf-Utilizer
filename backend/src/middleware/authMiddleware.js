import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import fs from 'fs';

// 1. Middleware to check token and set req.user (Does not block guests)
export const identifyUser = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    req.user = null; // Guest Mode
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findByPk(decoded.id);
    req.user = user; // Authenticated User
  } catch (err) {
    console.error("Token verification failed:", err.message);
    req.user = null; // Treat invalid token as guest
  }
  next();
};

// 2. Middleware to enforce Plan Limits
export const checkPlanLimits = (req, res, next) => {
  const file = req.file;
  if (!file) return next(); // No file to check (or handled by multer error)

  const fileSizeMB = file.size / (1024 * 1024);

  // --- GUEST LIMITS ---
  if (!req.user) {
    const GUEST_LIMIT_MB = 5; 
    if (fileSizeMB > GUEST_LIMIT_MB) {
      // Delete the file immediately to save space
      fs.unlinkSync(file.path);
      return res.status(403).json({ 
        error: `Guests are limited to ${GUEST_LIMIT_MB}MB files. Please create a free account for more.` 
      });
    }
    return next();
  }

  // --- FREE PLAN LIMITS ---
  if (req.user.plan === 'free') {
    const FREE_LIMIT_MB = 20;
    if (fileSizeMB > FREE_LIMIT_MB) {
      fs.unlinkSync(file.path);
      return res.status(403).json({ 
        error: `Free plan limited to ${FREE_LIMIT_MB}MB. Upgrade to Pro for unlimited size.` 
      });
    }
  }

  // --- PRO PLAN (Unlimited) ---
  next();
};