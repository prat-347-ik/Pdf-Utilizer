import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { comparePdfs } from '../controllers/diffController.js';

const router = express.Router();

// Expects form-data: { file1: [pdf], file2: [pdf] }
router.post(
  '/', 
  upload.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }]), 
  comparePdfs
);

export default router;