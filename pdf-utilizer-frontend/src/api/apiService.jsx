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
export const extractText = (formData) => api.post("/pdf/extract-text", formData);
export const extractImages = (formData) => api.post("/pdf/extract-images", formData);
export const signPDF = (formData) => api.post("/pdf/sign", formData);
export const protectPDF = (formData) => api.post("/pdf/protect", formData);
export const rotatePDF = (formData) => api.post("/pdf/rotate", formData);
export const compressPDF = (formData) => api.post("/pdf/compress", formData);

// TTS API
export const textToSpeech = (formData) => api.post("/api/tts", formData);
export const speechToText = (formData) => api.post("/api/stt", formData);

// Translate API
export const translateText = (formData) => api.post("/api/translate", formData);

export default api;
