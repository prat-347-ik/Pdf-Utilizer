import express from 'express';
import upload from '../middleware/uploadMiddleware.js'; 
import { generateQuiz } from '../controllers/quizController.js';

const router = express.Router();

// POST http://localhost:5000/api/quiz/generate
router.post('/generate', upload.single('file'), generateQuiz);

export default router;