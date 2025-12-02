import { useState } from "react";
import { rotatePDF } from "../api/apiService"; 
import ToolLayout from "../components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCw, UploadCloud, FileText, CheckCircle, AlertCircle, 
  Download, RefreshCw, X, Layers
} from "lucide-react";

const RotatePDF = () => {
  const [file, setFile] = useState(null);
  const [angle, setAngle] = useState(0); // Default to 0 degrees
  const [allPages, setAllPages] = useState(true);
  const [selectedPages, setSelectedPages] = useState("");
  const [rotatedFile, setRotatedFile] = useState(null);
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
        setMessage(null);
        setRotatedFile(null);
      } else {
        setMessage({ type: "error", text: "Please upload a valid PDF file." });
      }
    }
  };
  // -----------------------------

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      setRotatedFile(null);
    }
  };

  const handleRotate = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a file." });
      return;
    }

    if (angle === 0) {
       setMessage({ type: "error", text: "Please select a rotation angle." });
       return;
    }

    if (!allPages && !selectedPages.trim()) {
      setMessage({ type: "error", text: "Please specify pages to rotate." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("angle", angle);
    formData.append("all_pages", allPages);
    if (!allPages) {
      formData.append("pages", selectedPages);
    }

    try {
      const response = await rotatePDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setRotatedFile(url);
      setMessage({ type: "success", text: "PDF rotated successfully!" });
    } catch (error) {
      console.error("Rotate error:", error);
      setMessage({ type: "error", text: "Error rotating PDF. Please try again." });
    }
    setLoading(false);
  };

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Permanently rotate PDF pages. Fix orientation for all pages or specific ones."
      theme="blue" // Uses Cyan/Blue gradient
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        
        {/* LEFT PANEL: Upload & Settings */}
        <motion.div 
          className="w-full lg:w-1/3 flex flex-col gap-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Upload Card */}
          <div className="bg-white/60 dark:bg-cyan-900/20 backdrop-blur-md p-6 rounded-3xl border border-cyan-200 dark:border-cyan-500/30 shadow-sm">
            <h3 className="text-cyan-900 dark:text-cyan-200 font-bold mb-4 flex items-center gap-2">
              <UploadCloud size={20}/> Upload Document
            </h3>

            {!file ? (
              <div className="relative group mb-6">
                <input type="file" accept="application/pdf" onChange={handleFileChange} id="rotate-upload" className="hidden" />
                <label
                  htmlFor="rotate-upload"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-cyan-400/50 rounded-2xl bg-cyan-500/5 hover:bg-cyan-500/10 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-cyan-500/20 mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <p className="text-cyan-800 dark:text-cyan-200 font-medium">Select PDF</p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400/60 mt-1">Fix Orientation</p>
                </label>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl mb-6"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-cyan-500/20 rounded-lg shrink-0">
                    <FileText className="text-cyan-700 dark:text-cyan-300" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-gray-900 dark:text-white font-bold truncate text-sm">{file.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ready to rotate</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setRotatedFile(null); setAngle(0); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition shrink-0">
                  <X size={18} />
                </button>
              </motion.div>
            )}

            {/* Rotation Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Rotation Angle</label>
                <div className="flex gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setAngle(deg)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                        angle === deg 
                          ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30" 
                          : "bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-white/20"
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Pages to Rotate</label>
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={allPages} 
                      onChange={() => setAllPages(true)}
                      className="accent-cyan-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">All Pages</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={!allPages} 
                      onChange={() => setAllPages(false)}
                      className="accent-cyan-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Specific Pages</span>
                  </label>
                </div>
                
                <AnimatePresence>
                  {!allPages && (
                    <motion.input
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      type="text"
                      placeholder="e.g. 1, 3-5"
                      value={selectedPages}
                      onChange={(e) => setSelectedPages(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-cyan-500 text-gray-700 dark:text-white transition"
                    />
                  )}
                </AnimatePresence>
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
                    : "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-200 border border-cyan-200 dark:border-cyan-500/30"
                }`}
              >
                {message.type === "error" ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <button 
            onClick={handleRotate} 
            disabled={loading || !file}
            className="w-full py-4 rounded-xl font-bold shadow-lg text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center justify-center gap-2 mt-auto"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <><RotateCw size={20} /> Rotate PDF</>
            )}
          </button>
        </motion.div>

        {/* RIGHT PANEL: Visualization */}
        <motion.div 
          className="flex-1 flex flex-col bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/10 shadow-inner overflow-hidden relative items-center justify-center"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {rotatedFile ? (
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-cyan-600 dark:text-cyan-400 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Rotation Applied!</h3>
              <p className="text-gray-500 dark:text-gray-300 mb-8 max-w-sm mx-auto">
                Your document has been rotated successfully.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => { setRotatedFile(null); setFile(null); setAngle(0); }}
                  className="px-6 py-3 rounded-xl font-medium bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/20 transition"
                >
                  Start Over
                </button>
                <a 
                  href={rotatedFile} 
                  download="rotated_document.pdf"
                  className="px-8 py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition transform hover:scale-105"
                >
                  <Download size={20} /> Download PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400/50 dark:text-white/20 pointer-events-none p-8 text-center">
              {/* Animated Rotation Icon */}
              <motion.div 
                animate={{ rotate: angle }}
                transition={{ type: "spring", stiffness: 60 }}
                className="w-32 h-40 border-4 border-dashed border-current rounded-xl flex items-center justify-center mb-6 opacity-30 origin-center"
              >
                <FileText size={48} />
              </motion.div>
              <p className="text-lg font-medium">Rotation Preview</p>
              <p className="text-sm">Current Angle: {angle}°</p>
            </div>
          )}
        </motion.div>

      </div>
    </ToolLayout>
  );
};

export default RotatePDF;