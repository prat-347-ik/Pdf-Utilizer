import express from 'express';
import { register, login , refresh, logout } from '../controllers/authController.js';

const router = express.Router();

// POST /auth/register
router.post('/register', register);

// POST /auth/login
router.post('/login', login);

router.post('/refresh', refresh); // New Route
router.post('/logout', logout);   // New Route

export default router;