import { spawn } from 'child_process';
import path from 'path';

export const runPythonScript = (operation, payload) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('services/pdf_processor.py'); 
    
    // ✅ FIX: Removed the 'env' option. Let Python handle encoding internally.
    const pythonProcess = spawn('python', [scriptPath, operation, JSON.stringify(payload)]);

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
        reject(new Error(`Failed to parse Python output: ${dataString}`));
      }
    });
  });
};