import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Updated Filter: Allows PDFs generally, and Images specifically for the 'signature' field
const fileFilter = (req, file, cb) => {
  // Allow PDF files
  if (file.mimetype === 'application/pdf') {
    return cb(null, true);
  }
  
  // Allow Images (JPEG, PNG) - Useful for Signature upload
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    return cb(null, true);
  }

  // Reject other files
  cb(new Error('Only PDF and Image (PNG/JPG) files are allowed!'), false);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Limit to 50MB
});

export default upload;