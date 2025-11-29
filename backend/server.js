import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';

// Import Routes
import authRoutes from './src/routes/authRoutes.js';
import pdfRoutes from './src/routes/pdfRoutes.js'; 
import translateRoutes from './src/routes/translateRoutes.js'; // Add this
//import sttRoutes from './src/routes/sttRoutes.js'; // Add this
//import ttsRoutes from './src/routes/ttsRoutes.js'; // Add this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

connectDB();

// Use Routes
app.use('/auth', authRoutes);
app.use('/pdf', pdfRoutes);
app.use('/api', translateRoutes);
//app.use('/tts', ttsRoutes); // Add this
//app.use('/stt', sttRoutes); // Add this

app.get('/', (req, res) => {
  res.send('PDF Utilizer Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});