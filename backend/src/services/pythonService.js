import { spawn } from 'child_process';
import path from 'path';

export const runPythonScript = (operation, payload) => {
  return new Promise((resolve, reject) => {
    // Path to the pdf_processor.py file we just created
    // Adjust '../services' based on your folder structure
    const scriptPath = path.resolve('services/pdf_processor.py'); 
    
    // Spawn the Python process
    const pythonProcess = spawn('python', [scriptPath, operation, JSON.stringify(payload)]);

    let dataString = '';
    let errorString = '';

    // Collect data from Python's print() statements
    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    // Collect error logs
    pythonProcess.stderr.on('data', (data) => {
      errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0 && errorString) {
        return reject(new Error(`Python Script Error: ${errorString}`));
      }
      try {
        // Parse the JSON response
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