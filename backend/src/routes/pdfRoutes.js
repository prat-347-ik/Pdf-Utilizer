import express from 'express';
import upload from '../middleware/uploadMiddleware.js'; // Assuming you have multer set up here
import { 
  mergePDFs, 
  splitPDF, 
  rotatePDF, 
  protectPDF,
  compressPDF,
  extractText,
  extractImages,
  signPDF
} from '../controllers/pdfController.js';

const router = express.Router();

router.post('/merge', upload.array('files', 10), mergePDFs);
router.post('/split', upload.single('file'), splitPDF);
router.post('/rotate', upload.single('file'), rotatePDF);
router.post('/protect', upload.single('file'), protectPDF);
router.post('/compress', upload.single('file'), compressPDF);
router.post('/extract-text', upload.single('file'), extractText);
router.post('/extract-images', upload.single('file'), extractImages);

// Sign expects two files: the PDF ('file') and the signature image ('signature')
router.post('/sign', upload.fields([
  { name: 'file', maxCount: 1 }, 
  { name: 'signature', maxCount: 1 }
]), signPDF);

export default router;