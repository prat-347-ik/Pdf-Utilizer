import { useState } from "react";
import { translateText } from "../api/apiService.jsx"; // Ensure extension is correct
import ToolLayout from "../components/ToolLayout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Languages, UploadCloud, FileText, CheckCircle, AlertCircle, 
  Download, ArrowRight, X, Globe, BookOpen
} from "lucide-react";


const Translate = () => {
  const [file, setFile] = useState(null);
  const [targetLang, setTargetLang] = useState("es");
  const [translatedFile, setTranslatedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const languages = [
    { code: "en", name: "English (US)" },
    { code: "es", name: "Spanish (Español)" },
    { code: "fr", name: "French (Français)" },
    { code: "de", name: "German (Deutsch)" },
    { code: "it", name: "Italian (Italiano)" },
    { code: "pt", name: "Portuguese (Português)" },
    { code: "nl", name: "Dutch (Nederlands)" },
    { code: "ru", name: "Russian (Русский)" },
    { code: "zh", name: "Chinese (中文)" },
    { code: "ja", name: "Japanese (日本語)" },
    { code: "ko", name: "Korean (한국어)" },
    { code: "hi", name: "Hindi (हिन्दी)" },
    { code: "ar", name: "Arabic (العربية)" },
  ];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setTranslatedFile(null);
    setMessage(null);
  };

  const handleTranslate = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF file." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLang", targetLang);

    try {
      const response = await translateText(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setTranslatedFile(url);
      setMessage({ type: "success", text: "Translation complete!" });
    } catch (error) {
      console.error("Translation error:", error);
      setMessage({ type: "error", text: "Translation failed. Please try again." });
    }
    setLoading(false);
  };

  return (
    <ToolLayout
      title="Translate PDF"
      description="Break language barriers. Translate entire PDF documents while preserving the original layout."
      theme="blue"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        
        {/* LEFT PANEL: Upload & Settings */}
        <motion.div 
          className="w-full lg:w-1/3 flex flex-col gap-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Upload Card */}
          <div className="bg-white/60 dark:bg-blue-900/20 backdrop-blur-md p-6 rounded-3xl border border-blue-200 dark:border-blue-500/30 shadow-sm">
            <h3 className="text-blue-900 dark:text-blue-200 font-bold mb-4 flex items-center gap-2">
              <UploadCloud size={20}/> Upload Document
            </h3>

            {!file ? (
              <div className="relative group mb-6">
                <input type="file" accept="application/pdf" onChange={handleFileChange} id="trans-upload" className="hidden" />
                <label
                  htmlFor="trans-upload"
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-blue-400/50 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-blue-500/20 mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">Select PDF</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400/60 mt-1">To Translate</p>
                </label>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl mb-6"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-blue-500/20 rounded-lg shrink-0">
                    <FileText className="text-blue-700 dark:text-blue-300" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-gray-900 dark:text-white font-bold truncate text-sm">{file.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ready for translation</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setTranslatedFile(null); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition shrink-0">
                  <X size={18} />
                </button>
              </motion.div>
            )}

            {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Globe size={16} /> Target Language
                </label>

                <div className="relative">
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="
                      w-full p-3 pr-10 rounded-2xl
                      bg-blue-50/60 dark:bg-blue-900/20
                      border border-blue-200/60 dark:border-blue-700/40
                      text-blue-900 dark:text-blue-100
                      shadow-sm backdrop-blur-md
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      transition-all outline-none appearance-none
                    "
                  >
                    {languages.map((lang) => (
                      <option
                        key={lang.code}
                        value={lang.code}
                        className="text-blue-900 dark:text-blue-200"
                      >
                        {lang.name}
                      </option>
                    ))}
                  </select>

                  {/* Custom Arrow */}
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-700 dark:text-blue-300 opacity-70">
                    ▼
                  </div>
                </div>
              </div>

          </div>

          {/* Status Message */}
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
                  message.type === "error" 
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200 border border-red-200 dark:border-red-500/30" 
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-500/30"
                }`}
              >
                {message.type === "error" ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <button 
            onClick={handleTranslate} 
            disabled={loading || !file}
            className="w-full py-4 rounded-xl font-bold shadow-lg text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center justify-center gap-2 mt-auto"
          >
            {loading ? (
              <span className="animate-pulse">Translating...</span>
            ) : (
              <><Languages size={20} /> Translate Now</>
            )}
          </button>
        </motion.div>

        {/* RIGHT PANEL: Result Area */}
        <motion.div 
          className="flex-1 flex flex-col bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/10 shadow-inner overflow-hidden relative items-center justify-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {translatedFile ? (
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="text-blue-600 dark:text-blue-400 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Translation Ready!</h3>
              <p className="text-gray-500 dark:text-gray-300 mb-8 max-w-sm mx-auto">
                Your document has been translated to {languages.find(l => l.code === targetLang)?.name.split(' ')[0]}.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => { setTranslatedFile(null); setFile(null); }}
                  className="px-6 py-3 rounded-xl font-medium bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/20 transition"
                >
                  Translate Another
                </button>
                <a 
                  href={translatedFile} 
                  download={`translated_${targetLang}.pdf`}
                  className="px-8 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition transform hover:scale-105"
                >
                  <Download size={20} /> Download PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400/50 dark:text-white/20 pointer-events-none p-8 text-center">
              <Globe size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No translation yet</p>
              <p className="text-sm">Upload a document to start translating</p>
            </div>
          )}
        </motion.div>

      </div>
    </ToolLayout>
  );
};

export default Translate;