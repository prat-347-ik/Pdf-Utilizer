import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Assuming you have this
import { getProfile, updateProfile, updatePlan, changePassword, deleteAccount } from '../controllers/userController.js';
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/plan', protect, updatePlan);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

export default router;