import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


// Helper to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, plan: user.plan }, // Include plan in token
    process.env.SECRET_KEY,
    { expiresIn: '15m' } // Short life for security
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET || "some_super_secret_refresh_key", // Add REFRESH_SECRET to .env
    { expiresIn: '7d' } // Long life
  );

  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check if Email already exists (Updated Syntax)
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // 2. Check if Username already exists (Updated Syntax)
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the user (Mongoose supports create method similarly)
    await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Updated Syntax
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const { accessToken, refreshToken } = generateTokens(user);

    user.refreshToken = refreshToken;
    await user.save(); // Works the same in Mongoose

    res.json({ 
      message: 'Login successful',
      access_token: accessToken,
      refresh_token: refreshToken,
      // Note: user.id works in Mongoose (virtual getter for _id)
      user: { 
        username: user.username, 
        email: user.email, 
        plan: user.plan,
        avatar: user.avatar,   // Added
        fullName: user.fullName // Added
      }    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// NEW: Refresh Token Logic
export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "Refresh Token required" });

  try {
    // 1. Verify Request Token matches DB Token
    // We look for a user who HAS this specific refresh token
    const user = await User.findOne({ where: { refreshToken } });
    
    if (!user) {
        return res.status(403).json({ error: "Invalid Refresh Token" });
    }

    // 2. Verify Token Signature
    jwt.verify(refreshToken, process.env.REFRESH_SECRET || "some_super_secret_refresh_key", (err, decoded) => {
      if (err) return res.status(403).json({ error: "Token expired or invalid" });
      
      // 3. Generate NEW Access Token
      // (Optional: Rotate refresh token here for max security, but we'll keep it simple for now)
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, plan: user.plan },
        process.env.SECRET_KEY,
        { expiresIn: '15m' }
      );

      res.json({ access_token: accessToken });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during refresh" });
  }
};

// NEW: Logout Logic
export const logout = async (req, res) => {
    const { username } = req.body; 
    // Ideally use ID from verified token, but for now:
    try {
        const user = await User.findOne({ where: { username } });
        if (user) {
            user.refreshToken = null; // Revoke token
            await user.save();
        }
        res.json({ message: "Logged out successfully" });
    } catch (e) {
        res.status(500).json({ error: "Logout failed" });
    }
};