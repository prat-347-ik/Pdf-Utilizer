import path from 'path';
import fs from 'fs/promises';
import { runPythonScript } from '../services/pythonService.js';

// Helper to delete temp files
const cleanup = async (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    await Promise.all(fileList.map(f => fs.unlink(f).catch(() => {})));
};

export const translatePDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        if (!req.body.targetLang) return res.status(400).json({ error: 'Target language required' });

        const inputPath = path.resolve(req.file.path);
        const outputPath = path.resolve(`uploads/translated_${Date.now()}.pdf`);
        const targetLang = req.body.targetLang; // e.g., 'es', 'fr', 'hi'

        // Call Python script
        const result = await runPythonScript('translate', {
            file: inputPath,
            output: outputPath,
            lang: targetLang
        });

        // Send the file back
        res.download(result.filePath, 'translated_document.pdf', (err) => {
            if (err) console.error("Download error:", err);
            cleanup([inputPath, result.filePath]);
        });

    } catch (e) {
        // Attempt cleanup on error
        if (req.file) await cleanup(req.file.path);
        res.status(500).json({ error: e.message || "Translation failed" });
    }
};