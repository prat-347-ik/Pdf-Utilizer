import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const comparePdfs = (req, res) => {
  // Check if both files exist
  // Frontend must name inputs 'file1' and 'file2'
  if (!req.files || !req.files.file1 || !req.files.file2) {
    return res.status(400).json({ error: 'Please upload both an original and a modified version.' });
  }

  const file1Path = req.files.file1[0].path;
  const file2Path = req.files.file2[0].path;

  const scriptPath = path.join(__dirname, '../../services/diff_utils.py');

  // Spawn Python with both paths
  const pythonProcess = spawn('python', [scriptPath, file1Path, file2Path]);

  // Set Headers for Stream
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=comparison_result.pdf');

  // Pipe Output
  pythonProcess.stdout.pipe(res);

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Diff Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    // Cleanup BOTH files
    const cleanup = () => {
      fs.unlink(file1Path, (err) => err && console.error(err));
      fs.unlink(file2Path, (err) => err && console.error(err));
    };
    cleanup();
    
    if (code !== 0 && !res.headersSent) {
      res.status(500).json({ error: 'Comparison failed' });
    }
  });
};