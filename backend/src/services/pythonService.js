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

// ✅ FIX 1: Stream stdout to console immediately
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Python Output]: ${output}`); // <--- Add this
      dataString += output;
    });

// ✅ FIX 2: Stream stderr (errors/logs) to console immediately
    pythonProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      console.error(`[Python Log]: ${errorOutput}`); // <--- Add this
      errorString += errorOutput;
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