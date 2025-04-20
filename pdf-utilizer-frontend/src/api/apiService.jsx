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
export const extractImages = (formData) => api.post("/pdf/extract-images", formData,{
  responseType:"blob",
});
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
// STT: Upload audio file (returns PDF)
export const convertSpeechToText = (formData) =>
  api.post("/stt/convert", formData, {
    responseType: "blob", // So you can download the PDF directly
  });

// STT: Microphone (base64 audio)
export const convertSpeechFromMic = async (audioBase64) => {
  try {
    const response = await api.post(
      "/stt/convert",
      { audio_base64: audioBase64 },
      { responseType: "blob" }
    );

    return response; // PDF Blob
  } catch (error) {
    // Handle JSON error returned as Blob
    if (error.response && error.response.data instanceof Blob) {
      const text = await error.response.data.text();
      try {
        const json = JSON.parse(text);
        throw new Error(json.error || "Server error");
      } catch {
        throw new Error("Unknown error while converting speech from mic");
      }
    } else {
      throw new Error(error.message || "Request failed");
    }
  }
};




// Translate API
export const translateText = (formData) => api.post("/api/translate", formData,{
  responseType:"blob",
});



export default api;
