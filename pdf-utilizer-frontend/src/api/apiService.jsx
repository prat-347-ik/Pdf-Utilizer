import axios from "axios";

// ✅ UPDATE: Export this constant and use Env Variable for deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth APIs
export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const registerUser = (userData) => api.post("/auth/register", userData);
export const logoutUser = () => api.post("/auth/logout");


// --- USER & SETTINGS APIs ---
export const fetchUserProfile = async (token) => {
  const response = await api.get("/user/profile", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Update Profile: Handle JSON or FormData
export const updateUserProfile = async (data, token) => {
  const isFormData = data instanceof FormData;
  const response = await api.put("/user/profile", data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
    }
  });
  return response.data;
};

// Security APIs
export const changeUserPassword = async (passwords, token) => {
  const response = await api.put("/user/change-password", passwords, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteUserAccount = async (token) => {
  const response = await api.delete("/user/delete-account", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
export const updateUserPlan = async (plan, token) => {
  const response = await api.put("/user/plan", { plan }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// PDF APIs (File Uploads)
export const mergePDFs = (formData) =>
  api.post("/pdf/merge", formData, {
    responseType: "blob", 
  });

export const splitPDF = (formData) => api.post("/pdf/split", formData, {
  responseType: "blob", 
  // Custom timeout for large file processing
  timeout: 60000, 
});

export const extractText = (formData) => api.post("/pdf/extract-text", formData); 

export const extractImages = (formData) => api.post("/pdf/extract-images", formData, {
  responseType: "blob",
});

export const signPDF = (formData) => api.post("/pdf/sign", formData, {
  responseType: "blob",
});

export const protectPDF = (formData) => api.post("/pdf/protect", formData, {
  responseType: "blob",
});

export const rotatePDF = (formData) => api.post("/pdf/rotate", formData, {
  responseType: "blob",
});

export const compressPDF = (formData) => api.post("/pdf/compress", formData, {
  responseType: "blob",
});

// Smart Redaction API
export const redactPDF = (formData) => api.post("/redact", formData, {
  responseType: "blob",
});

// Visual Diff API
export const comparePDFs = (formData) => api.post("/diff", formData, {
  responseType: "blob", 
});

// TTS API
export const textToSpeech = (formData) => api.post("/tts/convert", formData, {
  responseType: "blob",
});

// STT: Upload audio file 
export const convertSpeechToText = (formData) =>
  api.post("/stt/convert", formData, {
    responseType: "blob", 
  });

// STT: Microphone 
export const convertSpeechFromMic = async (audioBase64) => {
  try {
    const response = await api.post(
      "/stt/convert",
      { audio_base64: audioBase64 },
      { responseType: "blob" }
    );
    return response; 
  } catch (error) {
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
export const translateText = (formData) => api.post("/api/translate", formData, {
  responseType: "blob",
});

export const generateQuiz = (formData) => 
  api.post("/api/quiz/generate", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
});

export default api;