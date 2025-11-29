import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { translatePDF } from '../controllers/translateController.js';

const router = express.Router();

// Route: POST /api/translate
router.post('/translate', upload.single('file'), translatePDF);

export default router;