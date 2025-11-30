import express from "express";
import { initChat, askChat } from "../controllers/chatController.js";
import upload from "../middleware/uploadMiddleware.js"; // <--- 1. Import this

const router = express.Router();

// Route: POST /api/chat/init
// 2. Add 'upload.single('file')' BEFORE the controller
router.post("/init", upload.single('file'), initChat); 

// Route: POST /api/chat/ask
router.post("/ask", askChat);

export default router;