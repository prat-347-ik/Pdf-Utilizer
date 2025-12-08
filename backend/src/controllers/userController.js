import User from '../models/User.js';
import bcrypt from 'bcryptjs';

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

// REVERTED: Update Profile (Back to simple text/string avatar)
export const updateProfile = async (req, res) => {
  try {
    const { fullName, avatar } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (fullName) user.fullName = fullName;
    if (avatar) user.avatar = avatar; // Expecting string (gradient class or URL)

    await user.save();
    
    // Return updated user info
    const { password, ...userData } = user._doc;
    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Update failed" });
  }
};

// 2. CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Verify Old Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// 3. DELETE ACCOUNT
export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    // Optional: Delete user's files from 'uploads/' folder here
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
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