import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 1. Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const redactPdf = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // req.body.redactionTypes should be a comma-separated string e.g. "EMAIL_ADDRESS,PERSON"
  const redactionTypes = req.body.redactionTypes || "EMAIL_ADDRESS,PHONE_NUMBER";
  
  const inputPath = req.file.path;
  const fileName = `redacted_${Date.now()}_${req.file.originalname}`;
  
  // Note: Ensure the 'uploads' directory exists in your root or handle it dynamically
  const outputPath = path.join('uploads', fileName); 

  // 2. Resolve path to Python script using the reconstructed __dirname
  const scriptPath = path.join(__dirname, '../../services/redact_utils.py');

  // Spawn Python Process
  const pythonProcess = spawn('python', [scriptPath, inputPath, outputPath, redactionTypes]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python Output: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      // Send back the download URL or file path
      res.json({ 
        message: 'Redaction successful', 
        downloadUrl: `/uploads/${fileName}` 
      });
      
      // Optional: Delete original upload to save space
      // fs.unlinkSync(inputPath); 
    } else {
      res.status(500).json({ error: 'Redaction process failed' });
    }
  });
};