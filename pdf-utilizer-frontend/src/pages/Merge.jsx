import { useState } from "react";
import { mergePDFs } from "../api/apiService";
import ToolLayout from "../components/ToolLayout"; // 👈 Import the new layout
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, X, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

const MergePDF = () => {
  const [files, setFiles] = useState([]);
  const [mergedFile, setMergedFile] = useState(null);
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
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.type === "application/pdf"
      );
      
      if (droppedFiles.length > 0) {
        setFiles((prev) => [...prev, ...droppedFiles]);
        setMessage(null);
      } else {
        setMessage({ type: "error", text: "Please upload valid PDF files only." });
      }
    }
  };
  // -----------------------------

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    // Append new files instead of replacing
    setFiles((prev) => [...prev, ...selectedFiles]);
    setMessage(null);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setMessage({ type: "error", text: "Please select at least two PDF files." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await mergePDFs(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setMergedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "Merge Complete!" });
    } catch (error) {
      console.error("Merge error:", error);
      setMessage({ type: "error", text: "Failed to merge. Try again." });
    }

    setLoading(false);
  };

  return (
    <ToolLayout
      title="Merge PDFs"
      description="Combine multiple PDF documents into a single, organized file. Perfect for reports, invoices, and archiving."
      theme="purple" // 👈 This sets the Purple/Creative theme
    >
      <div className="h-full flex flex-col">
        
        {/* 1. Modern Upload Area (The "Drop Zone") */}
        {!mergedFile && (
          <div className="mb-6">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              id="file-upload"
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              // --- ADDED DRAG & DROP HANDLERS ---
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              // ----------------------------------
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-500/50 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 transition-all cursor-pointer group"
            >
              <div className="p-4 rounded-full bg-purple-500/20 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-purple-600 dark:text-purple-300" />
              </div>
              {/* Fixed contrast for light mode: text-gray-600 dark:text-gray-300 */}
              <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                Click to upload or drag files here
              </p>
            </label>
          </div>
        )}

        {/* 2. File List (Floating Cards) */}
        <div className="flex-1 overflow-y-auto mb-6 pr-2">
           <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                layout // 👈 Added layout prop for smooth reordering
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} // Smoother exit
                className="flex items-center justify-between p-3 mb-3 bg-white/5 border border-purple-200 dark:border-white/10 rounded-xl hover:bg-purple-50 dark:hover:bg-white/10 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-red-500/10 dark:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                    <File size={18} />
                  </div>
                  <span className="text-sm truncate text-gray-700 dark:text-gray-200">{file.name}</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {files.length === 0 && !mergedFile && (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-10 italic">
              No files selected yet...
            </div>
          )}
        </div>

        {/* 3. Action Area (Bottom Sticky) */}
        <div className="mt-auto">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 mb-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium ${
                message.type === "success" 
                  ? "bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-500/30" 
                  : "bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/30"
              }`}
            >
              {message.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </motion.div>
          )}

          {!mergedFile ? (
            <button
              onClick={handleMerge}
              disabled={loading || files.length < 2}
              className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]
                ${loading || files.length < 2
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                }`}
            >
              {loading ? (
                <span className="animate-pulse">Merging Process...</span>
              ) : (
                <>Merge Files <ArrowRight size={18} /></>
              )}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setMergedFile(null); setFiles([]); }}
                className="py-3 rounded-xl font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Start Over
              </button>
              <button
                onClick={() => window.open(mergedFile, "_blank")}
                className="py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 transition transform hover:scale-[1.02]"
              >
                Download PDF
              </button>
            </div>
          )}
        </div>

      </div>
    </ToolLayout>
  );
};

export default MergePDF;