import { spawn } from 'child_process'; // Import the same runPythonScript helper logic or export it to a utils file
import path from 'path';
import fs from 'fs/promises';

// (Paste the runPythonScript helper here or import it)
// ...

export const convertSpeechToText = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });

    const audioPath = req.file.path;

    // python stt.py <audio_path>
    const result = await runPythonScript('stt.py', [audioPath]);

    // result is { text: "...", confidence: 1.0 }
    
    // Cleanup audio
    await fs.unlink(audioPath).catch(()=>{});

    res.json({ text: result.text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};