import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runPythonScript = (operation, payload) => {
  return new Promise((resolve, reject) => {
    // ✅ Fix: Go up two levels from 'src/services' to 'backend' then into 'services'
    // This finds the python file regardless of where you start the server
    const scriptPath = path.join(__dirname, '../../services/pdf_processor.py'); 
    
    const pythonProcess = spawn('python3', [scriptPath, operation, JSON.stringify(payload)]);

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
        // This will now show up in your logs if you catch it in the controller
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