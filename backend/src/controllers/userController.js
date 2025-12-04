import User from '../models/User.js';

// Get User Profile
export const getProfile = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware
    const user = await User.findById(req.user.id).select('-password'); 
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Update Profile (Avatar, Full Name)
export const updateProfile = async (req, res) => {
  try {
    const { fullName, avatar } = req.body;
    
    // Find user and update specific fields
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (fullName) user.fullName = fullName;
    if (avatar) user.avatar = avatar; // Stores string like "avatar-1" or URL

    await user.save();
    
    // Return updated user info (excluding password)
    res.json({ 
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar,
      plan: user.plan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Update failed" });
  }
};

// Update Plan (Mock Payment)
export const updatePlan = async (req, res) => {
  try {
    const { plan } = req.body; // 'free' or 'pro'

    if (!['free', 'pro'].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    const user = await User.findById(req.user.id);
    user.plan = plan;
    await user.save();

    res.json({ success: true, plan: user.plan });
  } catch (error) {
    res.status(500).json({ error: "Plan update failed" });
  }
};