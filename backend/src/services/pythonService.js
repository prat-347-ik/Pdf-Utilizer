import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runPythonScript = (operation, payload) => {
  return new Promise((resolve, reject) => {
    // Correct path resolution
    const scriptPath = path.join(__dirname, '../../services/pdf_processor.py'); 
    
    // 🔍 DYNAMIC COMMAND SELECTION
    // If we are on Windows ('win32'), use 'python'
    // If we are on Linux/Mac/Render, use 'python3'
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    const pythonProcess = spawn(pythonCommand, [scriptPath, operation, JSON.stringify(payload)]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0 && errorString) {
        return reject(new Error(`Python Script Error: ${errorString}`));
      }
      try {
        const response = JSON.parse(dataString || '{}');
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error || 'Unknown error from Python script'));
        }
      } catch (err) {
        reject(new Error(`Failed to parse Python output: ${dataString}. Error: ${errorString}`));
      }
    });
  });
};