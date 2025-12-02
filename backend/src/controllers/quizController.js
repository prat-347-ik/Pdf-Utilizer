import path from 'path';
import fs from 'fs/promises';
import { runPythonScript } from '../services/pythonService.js';

// Helper to cleanup files
const cleanup = async (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    await Promise.all(fileList.map(f => fs.unlink(f).catch(() => {})));
};

export const generateQuiz = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const inputPath = path.resolve(req.file.path);

        // Call Python script
        // Note: We don't need an 'output' path anymore since we aren't saving a PDF
        const result = await runPythonScript('generate_quiz', {
            file: inputPath
        });

        // Result.quiz contains the Array of questions
        res.json({ success: true, quiz: result.quiz });

        // Cleanup the uploaded PDF immediately
        await cleanup(inputPath);

    } catch (e) {
        if (req.file) await cleanup(path.resolve(req.file.path));
        res.status(500).json({ error: e.message || "Failed to generate quiz" });
    }
};