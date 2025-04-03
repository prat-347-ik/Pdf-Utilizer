import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Ensure this matches your backend

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth APIs
export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const registerUser = (userData) => api.post("/auth/register", userData);
export const logoutUser = () => api.post("/auth/logout");

// PDF APIs (File Uploads)
export const mergePDFs = (formData) =>
  api.post("/pdf/merge", formData, {
    responseType: "blob", // Expect a file response
  });

export const splitPDF = (formData) => api.post("/pdf/split", formData,{
  responseType: "blob", // Expect a file response
});
export const extractText = (formData) => api.post("/pdf/extract_text", formData,{
  responseType:"blob",
}

);
export const extractImages = (formData) => api.post("/pdf/extract_images", formData);
export const signPDF = (formData) => api.post("/pdf/sign", formData,{
  responseType: "blob",
});
export const protectPDF = (formData) => api.post("/pdf/protect", formData,{
  responseType: "blob",
});
export const rotatePDF = (formData) => api.post("/pdf/rotate", formData,{
  responseType: "blob",
});
export const compressPDF = (formData) => api.post("/pdf/compress", formData,{
  responseType:"blob",
});

// TTS API
export const textToSpeech = (formData) => api.post("/tts/convert", formData,{
  responseType:"blob",
});
export const convertSpeechToText = (formData) =>
  api.post("/stt/convert", formData);

// STT API - Convert Microphone (Base64) Audio to Text
export const convertSpeechFromMic = (audioBase64) =>
  api.post("/stt/convert", { audio_base64: audioBase64 });

// Translate API
export const translateText = (formData) => api.post("/api/translate", formData,{
  responseType:"blob",
});

export default api;
