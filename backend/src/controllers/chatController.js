import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { runPythonScript } from '../services/pythonService.js';

// 1. Initialize Chat (Upload & Process)
export const initChat = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const inputPath = path.resolve(req.file.path);
        const indexId = uuidv4(); // Unique ID for this specific document session

        // Run Python to Chunk & Vectorize
        await runPythonScript('rag_ingest', { 
            file: inputPath, 
            index_id: indexId 
        });

        // Return the Session ID to the frontend
        res.json({ success: true, sessionId: indexId });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 2. Ask Question
export const askChat = async (req, res) => {
    try {
        const { sessionId, question } = req.body;
        if (!sessionId || !question) return res.status(400).json({ error: 'Missing session ID or question' });

        const result = await runPythonScript('rag_query', { 
            index_id: sessionId, 
            query: question 
        });

        res.json({ success: true, answer: result.answer, context: result.context });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};