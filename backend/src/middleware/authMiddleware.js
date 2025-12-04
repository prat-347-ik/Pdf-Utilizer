import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import fs from 'fs';

// 1. (NEW) Protect Middleware - STRICT (Blocks unauthenticated users)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      // Get user from the token (Mongoose Syntax: findById)
      // .select('-password') excludes the password field from the result
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         return res.status(401).json({ error: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// 2. Identify User Middleware - LAX (Does not block guests)
export const identifyUser = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    req.user = null; // Guest Mode
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // FIX: Changed findByPk (Sequelize) to findById (Mongoose)
    const user = await User.findById(decoded.id).select('-password');
    req.user = user; 
  } catch (err) {
    console.error("Token verification failed:", err.message);
    req.user = null; // Treat invalid token as guest
  }
  next();
};

// 3. Middleware to enforce Plan Limits
export const checkPlanLimits = (req, res, next) => {
  const file = req.file;
  if (!file) return next(); // No file to check (or handled by multer error)

  const fileSizeMB = file.size / (1024 * 1024);

  // --- GUEST LIMITS ---
  if (!req.user) {
    const GUEST_LIMIT_MB = 5; 
    if (fileSizeMB > GUEST_LIMIT_MB) {
      // Delete the file immediately to save space
      try { fs.unlinkSync(file.path); } catch (e) {}
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
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(403).json({ 
        error: `Free plan limited to ${FREE_LIMIT_MB}MB. Upgrade to Pro for unlimited size.` 
      });
    }
  }

  // --- PRO PLAN (Unlimited) ---
  next();
};