import { useState } from "react";
import apiService from "../api/apiService";
import { Upload, Download, Languages } from "lucide-react";
import { motion } from "framer-motion"; // For smooth animations
import Sidebar from "../components/Sidebar"; // ✅ Import Sidebar

const TranslatePage = () => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("fr");
  const [loading, setLoading] = useState(false);
  const [translatedFile, setTranslatedFile] = useState(null);

  const languages = [
    { code: "fr", name: "French" },
    { code: "hi", name: "Hindi" },
    { code: "zh-cn", name: "Chinese (Simplified)" },
    { code: "ar", name: "Arabic" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

  // Handle PDF translation
  const handleTranslatePDF = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_language", language);

    try {
      const response = await apiService.post("/api/translate", formData, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      setTranslatedFile(url);
    } catch (error) {
      console.error("PDF Translation error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-900 to-white text-gray-900 overflow-hidden">
      <Sidebar /> {/* ✅ Sidebar Added */}

      {/* ✅ Adjusted to make space for sidebar */}
      <div className="flex flex-1 justify-center items-center ml-64">
        <motion.div
          className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg border border-blue-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Page Heading */}
          <motion.h1
            className="text-4xl font-bold mb-8 flex items-center gap-2 text-blue-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Languages size={36} /> PDF Translation
          </motion.h1>

          {/* File Upload Section */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <Upload size={20} /> Upload PDF for Translation
            </h2>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
          </div>

          {/* Language Selection */}
          <div className="flex items-center gap-4 mb-4">
            <select
              className="bg-blue-50 p-3 rounded-lg border border-blue-400 text-gray-800 focus:outline-none focus:border-blue-600 transition"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>

            <motion.button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
              onClick={handleTranslatePDF}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
            >
              {loading ? "Translating..." : "Translate PDF"}
            </motion.button>
          </div>

          {/* Download Translated PDF */}
          {translatedFile && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <a
                href={translatedFile}
                download="translated_pdf.pdf"
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold text-white transition flex items-center gap-2"
              >
                <Download size={18} /> Download Translated PDF
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TranslatePage;
