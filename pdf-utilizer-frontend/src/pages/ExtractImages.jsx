import { useState } from "react";
import { extractImages } from "../api/apiService.jsx"; // Ensure extension is correct
import ToolLayout from "../components/ToolLayout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, UploadCloud, CheckCircle, AlertCircle, 
  Download, X, Layers, FileImage
} from "lucide-react";

const ExtractImages = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [extractedFile, setExtractedFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      setExtractedFile(null);
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF first." });
      return;
    }

    setLoading(true);
    setMessage(null);
    setExtractedFile(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await extractImages(formData);
      
      // Treat response as a ZIP file containing images
      const blob = new Blob([response.data], { type: "application/zip" });
      const fileURL = URL.createObjectURL(blob);
      
      setExtractedFile(fileURL);
      setMessage({ type: "success", text: "Images extracted successfully!" });
    } catch (error) {
      console.error("Extraction error:", error);
      setMessage({ type: "error", text: "Failed to extract images. Please try again." });
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (extractedFile) {
      const link = document.createElement('a');
      link.href = extractedFile;
      link.download = "extracted_images.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <ToolLayout
      title="Extract Images"
      description=" effortlessly extract all images from your PDF documents into a downloadable ZIP file."
      theme="amber"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        
        {/* LEFT PANEL: Upload & Actions */}
        <motion.div 
          className="w-full lg:w-1/3 flex flex-col gap-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Upload Card */}
          <div className="bg-white/60 dark:bg-amber-900/20 backdrop-blur-md p-6 rounded-3xl border border-amber-200 dark:border-amber-500/30 shadow-sm">
            <h3 className="text-amber-900 dark:text-amber-200 font-bold mb-4 flex items-center gap-2">
              <UploadCloud size={20}/> Upload Document
            </h3>

            {!file ? (
              <div className="relative group">
                <input type="file" accept="application/pdf" onChange={handleFileChange} id="img-upload" className="hidden" />
                <label
                  htmlFor="img-upload"
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-amber-400/50 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-amber-500/20 mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-amber-800 dark:text-amber-200 font-medium">Select PDF</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400/60 mt-1">Files with embedded images</p>
                </label>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                    <FileImage className="text-amber-700 dark:text-amber-300" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-gray-900 dark:text-white font-bold truncate text-sm">{file.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ready to extract</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setExtractedFile(null); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition shrink-0">
                  <X size={18} />
                </button>
              </motion.div>
            )}
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
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-200 border border-amber-200 dark:border-amber-500/30"
                }`}
              >
                {message.type === "error" ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extract Button */}
          <button 
            onClick={handleExtract} 
            disabled={loading || !file}
            className="w-full py-4 rounded-xl font-bold shadow-lg text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center justify-center gap-2 mt-auto"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <><Layers size={20} /> Extract Images</>
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
          {extractedFile ? (
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-amber-600 dark:text-amber-400 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Extraction Complete!</h3>
              <p className="text-gray-500 dark:text-gray-300 mb-8 max-w-sm mx-auto">
                Your images have been successfully extracted and packaged into a ZIP file.
              </p>
              
              <button 
                onClick={handleDownload}
                className="px-8 py-3 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 flex items-center gap-2 transition transform hover:scale-105 mx-auto"
              >
                <Download size={20} /> Download ZIP
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400/50 dark:text-white/20 pointer-events-none p-8 text-center">
              <ImageIcon size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">No images extracted yet</p>
              <p className="text-sm">Upload a PDF to retrieve embedded images</p>
            </div>
          )}
        </motion.div>

      </div>
    </ToolLayout>
  );
};

export default ExtractImages;