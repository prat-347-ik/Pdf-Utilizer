import { useState } from "react";
import apiService from "../api/apiService";
import { Upload, Download, Languages } from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";

const TranslatePage = () => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("fr");
  const [loading, setLoading] = useState(false);
  const [translatedFile, setTranslatedFile] = useState(null);

  const languages = [
    { code: "fr", name: "French" },
    //#endregion{ code: "it", name: "Italian" },
    { code: "zh-cn", name: "Chinese (Simplified)" },
    { code: "ar", name: "Arabic" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

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
    <div className="flex min-h-screen bg-gradient-to-br from-[#474E93] via-[#7E5CAD] to-[#FBB4A5] text-gray-900 overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 justify-center items-center ml-64">
        <motion.div
          className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg border border-[#72BAA9]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl font-bold mb-8 flex items-center gap-2 text-[#474E93]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Languages size={36} /> PDF Translation
          </motion.h1>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-3 text-[#474E93] flex items-center gap-2">
              <Upload size={20} /> Upload PDF for Translation
            </h2>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#7E5CAD] file:text-white hover:file:bg-[#474E93] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-4 mb-4">
            <select
              className="bg-[#EFF3EA] p-3 rounded-lg border border-[#B7B1F2] text-gray-800 focus:outline-none focus:border-[#7E5CAD] transition"
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
              className="bg-[#72BAA9] hover:bg-[#5BA697] text-white px-4 py-2 rounded-lg font-bold transition flex items-center gap-2"
              onClick={handleTranslatePDF}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
            >
              {loading ? "Translating..." : "Translate PDF"}
            </motion.button>
          </div>

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
                className="bg-[#FFE2E2] hover:bg-[#FFCFCF] px-4 py-2 rounded-lg font-bold text-white transition flex items-center gap-2"
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
