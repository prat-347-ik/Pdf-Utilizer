import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const redactPdf = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const redactionTypes = req.body.redactionTypes || "EMAIL_ADDRESS,PHONE_NUMBER";
  const inputPath = req.file.path;
  
  // Point to the Python script
  const scriptPath = path.join(__dirname, '../../services/redact_utils.py');

  // Spawn Python (Note: We do NOT pass an output path anymore)
  const pythonProcess = spawn('python', [scriptPath, inputPath, redactionTypes]);

  // Set Headers for Download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=redacted_${req.file.originalname}`);

  // PIPE output directly to response
  pythonProcess.stdout.pipe(res);

  // Log Errors
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Log: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    // Clean up input file
    fs.unlink(inputPath, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    if (code !== 0 && !res.headersSent) {
      res.status(500).json({ error: 'Redaction process failed' });
    }
  });
};