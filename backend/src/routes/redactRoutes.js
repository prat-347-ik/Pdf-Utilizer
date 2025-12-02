import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { redactPdf } from '../controllers/redactController.js';

const router = express.Router();

// Route: POST /redact
// Description: Accepts a file and PII types, returns redacted PDF path/URL
// Endpoint: http://localhost:5000/redact
router.post('/', upload.single('file'), redactPdf);

export default router;