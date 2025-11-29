import { useState } from "react";
import { translateText } from "../api/apiService";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { FileText, Languages, Download, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const Translate = () => {
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState("es");
  const [translatedFile, setTranslatedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const languages = [
    { code: "es", name: "Spanish (Español)" },
    { code: "fr", name: "French (Français)" },
    { code: "de", name: "German (Deutsch)" },
    { code: "hi", name: "Hindi (हिन्दी)" },
    { code: "zh-CN", name: "Chinese Simplified (简体中文)" },
    { code: "ja", name: "Japanese (日本語)" },
    { code: "ko", name: "Korean (한국어)" },
    { code: "ru", name: "Russian (Русский)" },
    { code: "it", name: "Italian (Italiano)" },
    { code: "pt", name: "Portuguese (Português)" },
    { code: "ar", name: "Arabic (العربية)" }
  ];

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setMessage({ type: "error", text: "Please upload a valid PDF file." });
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setMessage({ type: "", text: "" });
    setTranslatedFile(null);
  };

  const handleTranslate = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF file first." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Translating... This may take a few moments." });
    setTranslatedFile(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLang", targetLang);

    try {
      const response = await translateText(formData);
      
      if (response.data instanceof Blob) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const downloadUrl = URL.createObjectURL(blob);
        setTranslatedFile(downloadUrl);
        setMessage({ type: "success", text: "Translation complete! Ready to download." });
      } else {
        throw new Error("Translation failed. Verify the PDF content.");
      }
    } catch (error) {
      console.error("Translation error:", error);
      setMessage({ type: "error", text: "Error translating PDF. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Outer container: Fixed height screen, hidden overflow (sidebar stays put)
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 to-blue-100 font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      {/* Main Content: Takes remaining width, scrollable Y-axis */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8">
        <div className="flex flex-col items-center justify-start min-h-full pb-20">
          
          <motion.div 
            // ✅ FIX: Removed 'overflow-hidden' from here.
            // This ensures the card grows as tall as needed without clipping children.
            className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-indigo-100 my-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Header: Applied rounding and overflow-hidden ONLY here */}
            <div className="bg-indigo-600 p-8 text-center relative overflow-hidden rounded-t-3xl">
              <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 transform -skew-y-6 scale-150 origin-top-left"></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
              >
                <Languages className="w-16 h-16 text-white mx-auto mb-4 opacity-90" />
                <h1 className="text-3xl font-extrabold text-white tracking-tight">PDF Translator</h1>
                <p className="text-indigo-100 mt-2 text-lg">Translate documents into 10+ languages</p>
              </motion.div>
            </div>

            <div className="p-8 space-y-8">
              {/* Message Alert */}
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    message.type === "error" ? "bg-red-50 text-red-700 border border-red-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {message.type === "success" && <CheckCircle className="w-5 h-5" />}
                  {message.type === "error" && <AlertCircle className="w-5 h-5" />}
                  {message.type === "info" && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                  {message.text}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    1. Upload Document
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                        file ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                      }`}
                    >
                      <FileText className={`w-8 h-8 mb-2 ${file ? "text-indigo-600" : "text-slate-400"}`} />
                      <span className={`text-sm font-medium text-center px-2 ${file ? "text-indigo-700" : "text-slate-500"}`}>
                        {file ? (file.name.length > 20 ? file.name.substring(0,20)+"..." : file.name) : "Click to Upload PDF"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider">
                    2. Select Language
                  </label>
                  <div className="relative h-32 flex items-center">
                      <select
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow cursor-pointer appearance-none"
                      >
                          {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                              {lang.name}
                          </option>
                          ))}
                      </select>
                      <div className="absolute right-4 pointer-events-none text-slate-500">
                          <ArrowRight className="w-5 h-5 rotate-90" />
                      </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                <motion.button
                  onClick={handleTranslate}
                  disabled={loading || !file}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                    loading || !file
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200"
                  }`}
                >
                  {loading ? "Translating..." : "Translate Document"}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </motion.button>

                {translatedFile && (
                  <motion.a
                    href={translatedFile}
                    download={`translated_${targetLang}.pdf`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-600 hover:shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download Translated PDF
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Translate;