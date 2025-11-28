import express from 'express';
import { convertSpeechToText } from '../controllers/sttController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/convert', upload.single('audio'), convertSpeechToText);

export default router;