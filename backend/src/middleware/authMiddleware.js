import express from 'express';
import upload from '../middleware/uploadMiddleware.js'; 
import { identifyUser, checkPlanLimits } from '../middleware/authMiddleware.js'; // Import new middleware
import { 
  mergePDFs, splitPDF, rotatePDF, protectPDF,
  compressPDF, extractText, extractImages, signPDF
} from '../controllers/pdfController.js';

const router = express.Router();

// Apply identification globally to this router (or per route)
router.use(identifyUser);

// Helper to wrap upload + limit check
const processUpload = (fieldName) => [
  upload.single(fieldName),
  checkPlanLimits
];

router.post('/merge', upload.array('files', 10), checkPlanLimits, mergePDFs); // Array handled slightly differently in logic, but checkPlanLimits logic might need slight tweak for arrays if strict.
router.post('/split', processUpload('file'), splitPDF);
router.post('/rotate', processUpload('file'), rotatePDF);
router.post('/protect', processUpload('file'), protectPDF);
router.post('/compress', processUpload('file'), compressPDF);
router.post('/extract-text', processUpload('file'), extractText);
router.post('/extract-images', processUpload('file'), extractImages);

router.post('/sign', 
  upload.fields([{ name: 'file', maxCount: 1 }, { name: 'signature', maxCount: 1 }]),
  checkPlanLimits, // Checks the main file size
  signPDF
);

export default router;