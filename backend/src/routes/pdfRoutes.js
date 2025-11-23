import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { 
  mergePDFs, 
  splitPDF, 
  rotatePDF, 
  protectPDF 
} from '../controllers/pdfController.js';
const router = express.Router();

// 1. Merge (Files array)
router.post('/merge', upload.array('files', 10), mergePDFs);

// 2. Split (Single file + range)
router.post('/split', upload.single('file'), splitPDF);

// 3. Rotate (Single file + rotation angle)
router.post('/rotate', upload.single('file'), rotatePDF);

// 4. Protect (Single file + password)
router.post('/protect', upload.single('file'), protectPDF);

export default router;