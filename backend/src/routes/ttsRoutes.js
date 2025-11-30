import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { convertToAudio } from '../controllers/ttsController.js';

const router = express.Router();

router.post('/convert', upload.single('file'), convertToAudio);

export default router;