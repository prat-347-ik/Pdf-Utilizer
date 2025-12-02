import { useState } from "react";
import { textToSpeech } from "../api/apiService"; 
import ToolLayout from "../components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Headphones, FileText, Download, Play, Loader, 
  Music, Volume2, Mic2, UploadCloud, X
} from "lucide-react";

const Audiobook = () => {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- NEW: Drag & Drop Logic ---
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setAudioUrl(null);
        setMessage(null);
      } else {
        setMessage({ type: "error", text: "Please upload a valid PDF file." });
      }
    }
  };
  // -----------------------------

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setAudioUrl(null);
    setMessage(null);
  };

  const handleConvert = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF file." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("lang", language);

    try {
      const response = await textToSpeech(formData);
      const blob = new Blob([response.data], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setMessage({ type: "success", text: "Audiobook generated successfully!" });
    } catch (error) {
      console.error("Audiobook error:", error);
      setMessage({ type: "error", text: "Failed to generate audiobook." });
    }
    setLoading(false);
  };

  return (
    <ToolLayout
      title="Audiobook Creator"
      description="Turn your PDF documents into immersive audiobooks. Listen on the go."
      theme="rose" // Using Rose for a distinct Audio vibe
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        
        {/* LEFT PANEL: Upload & Settings */}
        <motion.div 
          className="w-full lg:w-1/3 flex flex-col gap-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Upload Card */}
          <div className="bg-white/60 dark:bg-rose-900/20 backdrop-blur-md p-6 rounded-3xl border border-rose-200 dark:border-rose-500/30 shadow-sm">
            <h3 className="text-rose-900 dark:text-rose-200 font-bold mb-4 flex items-center gap-2">
              <UploadCloud size={20}/> Upload & Settings
            </h3>

            {!file ? (
              <div className="relative group mb-6">
                <input type="file" accept="application/pdf" onChange={handleFileChange} id="audio-upload" className="hidden" />
                <label
                  htmlFor="audio-upload"
                  // --- ADDED DRAG & DROP HANDLERS ---
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  // ----------------------------------
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-rose-400/50 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-rose-500/20 mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                  </div>
                  <p className="text-rose-800 dark:text-rose-200 font-medium">Select PDF</p>
                  <p className="text-xs text-rose-600 dark:text-rose-400/60 mt-1">Document to Audio</p>
                </label>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl mb-6"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-rose-500/20 rounded-lg shrink-0">
                    <FileText className="text-rose-700 dark:text-rose-300" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-gray-900 dark:text-white font-bold truncate text-sm">{file.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ready to convert</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setAudioUrl(null); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition shrink-0">
                  <X size={18} />
                </button>
              </motion.div>
            )}

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Mic2 size={16} /> Spoken Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 appearance-none outline-none focus:ring-2 focus:ring-rose-500 text-gray-700 dark:text-white transition"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="ja">Japanese</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleConvert} 
            disabled={loading || !file}
            className="w-full py-4 rounded-xl font-bold shadow-lg text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center justify-center gap-2 mt-auto"
          >
            {loading ? (
              <span className="animate-pulse">Generating Audio...</span>
            ) : (
              <><Headphones size={20} /> Create Audiobook</>
            )}
          </button>
        </motion.div>

        {/* RIGHT PANEL: Player */}
        <motion.div 
          className="flex-1 flex flex-col bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/10 shadow-inner overflow-hidden relative items-center justify-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {audioUrl ? (
            <div className="w-full max-w-md p-8 flex flex-col items-center">
              {/* Vinyl Animation */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="w-48 h-48 rounded-full bg-black border-4 border-gray-800 shadow-2xl flex items-center justify-center mb-8 relative"
              >
                <div className="absolute inset-0 rounded-full border border-white/10" style={{ margin: '10%' }} />
                <div className="absolute inset-0 rounded-full border border-white/10" style={{ margin: '20%' }} />
                <div className="absolute inset-0 rounded-full border border-white/10" style={{ margin: '30%' }} />
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center shadow-inner">
                  <Music size={24} className="text-white" />
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center line-clamp-1">
                {file?.name || "Audiobook"}
              </h3>
              <p className="text-rose-600 dark:text-rose-400 font-medium mb-8">Now Playing</p>
              
              {/* Custom Player Wrapper */}
              <div className="w-full bg-white/80 dark:bg-white/10 p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg">
                <audio controls src={audioUrl} className="w-full h-10 accent-rose-500" />
              </div>

              <div className="mt-8 flex gap-4">
                <a 
                  href={audioUrl} 
                  download={`audiobook_${language}.mp3`}
                  className="px-6 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 flex items-center gap-2 transition transform hover:scale-105"
                >
                  <Download size={20} /> Download MP3
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400/50 dark:text-white/20 pointer-events-none p-8 text-center">
              <div className="w-32 h-32 rounded-full border-4 border-dashed border-current flex items-center justify-center mb-6 opacity-30">
                <Volume2 size={48} />
              </div>
              <p className="text-lg font-medium">Player is empty</p>
              <p className="text-sm">Convert a PDF to start listening</p>
            </div>
          )}
        </motion.div>

      </div>
    </ToolLayout>
  );
};

export default Audiobook;