import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { connectDB } from './src/config/db.js';

// Import Routes
import authRoutes from './src/routes/authRoutes.js';
import pdfRoutes from './src/routes/pdfRoutes.js'; 
import translateRoutes from './src/routes/translateRoutes.js'; // Add this
//import sttRoutes from './src/routes/sttRoutes.js'; // Add this
import ttsRoutes from './src/routes/ttsRoutes.js'; // Add this
//PDF Chat RAG
import chatRoutes from './src/routes/chatRoutes.js';
// Import the new Redact Routes
import redactRoutes from './src/routes/redactRoutes.js';
// Import Diff Routes
import diffRoutes from './src/routes/diffRoutes.js';


dotenv.config();

// --- Fix for ES Modules Path Resolution ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ------------------------------------------

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

// --- ADD THIS LINE ---
// This tells Express: "If a request starts with /uploads, look for the file in the local 'uploads' folder"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ---------------------

connectDB();

// Use Routes
app.use('/auth', authRoutes);
app.use('/pdf', pdfRoutes);
app.use('/api', translateRoutes);
app.use('/tts', ttsRoutes); // Add this
//app.use('/stt', sttRoutes); // Add this
app.use('/api/chat', chatRoutes); // PDF Chat RAG
// This creates the endpoint: POST http://localhost:5000/redact
app.use('/redact', redactRoutes);

app.get('/', (req, res) => {
  res.send('PDF Utilizer Backend is Running!');
});

//  MOUNT DIFF ROUTE
// Endpoint: POST http://localhost:5000/diff
app.use('/diff', diffRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});