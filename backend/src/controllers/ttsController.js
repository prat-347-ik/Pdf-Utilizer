import path from 'path';
import fs from 'fs/promises';
import { runPythonScript } from '../services/pythonService.js';

// Helper to delete temp files
const cleanup = async (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    await Promise.all(fileList.map(f => fs.unlink(f).catch(() => {})));
};

export const convertToAudio = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const inputPath = path.resolve(req.file.path);
        const outputPath = path.resolve(`uploads/audiobook_${Date.now()}.mp3`);
        const lang = req.body.lang || 'en';

        const result = await runPythonScript('tts', {
            file: inputPath,
            output: outputPath,
            lang: lang
        });

        // Download the MP3
        res.download(result.filePath, 'audiobook.mp3', (err) => {
            if (err) console.error("Download error:", err);
            cleanup([inputPath, result.filePath]);
        });

    } catch (e) {
        if (req.file) await cleanup(req.file.path);
        res.status(500).json({ error: e.message || "Text-to-Speech conversion failed" });
    }
};