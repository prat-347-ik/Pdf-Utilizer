import { useState } from "react";
import { extractText } from "../api/apiService.jsx"; // Ensure extension is correct
import ToolLayout from "../components/ToolLayout.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, UploadCloud, CheckCircle, AlertCircle, 
  Copy, Download, X, ScanText, Clipboard
} from "lucide-react";

const ExtractText = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [extractedData, setExtractedData] = useState("");

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
        setExtractedData("");
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
      setExtractedData("");
    }
  };

  const handleExtractText = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF first." });
      return;
    }

    setLoading(true);
    setMessage(null);
    setExtractedData(""); 

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await extractText(formData);
      
      // Handle different response structures gracefully based on your backend
      // Checking for success flag OR direct data
      if (response.data.success || response.data.text) {
         const textResult = response.data.text || response.data.content || JSON.stringify(response.data, null, 2);
         setExtractedData(textResult);
         setMessage({ type: "success", text: "Text extracted successfully!" });
      } else {
        // Fallback for unexpected structure
        setExtractedData(JSON.stringify(response.data, null, 2));
        setMessage({ type: "success", text: "Extraction complete." });
      }

    } catch (error) {
      console.error("Extraction error:", error);
      setMessage({ type: "error", text: "Failed to extract text. Please try again." });
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedData);
    setMessage({ type: "success", text: "Copied to clipboard!" });
    setTimeout(() => setMessage(null), 2000);
  };

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([extractedData], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "extracted_text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <ToolLayout
      title="Extract Text"
      description="Convert scanned documents and PDFs into editable text using advanced OCR technology."
      theme="teal"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        
        {/* LEFT PANEL: Upload & Actions */}
        <motion.div 
          className="w-full lg:w-1/3 flex flex-col gap-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Upload Card */}
          <div className="bg-white/60 dark:bg-teal-900/20 backdrop-blur-md p-6 rounded-3xl border border-teal-200 dark:border-teal-500/30 shadow-sm">
            <h3 className="text-teal-900 dark:text-teal-200 font-bold mb-4 flex items-center gap-2">
              <UploadCloud size={20}/> Upload Document
            </h3>

            {!file ? (
              <div className="relative group">
                <input type="file" accept="application/pdf" onChange={handleFileChange} id="ocr-upload" className="hidden" />
                <label
                  htmlFor="ocr-upload"
                  // --- ADDED DRAG & DROP HANDLERS ---
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  // ----------------------------------
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-teal-400/50 rounded-2xl bg-teal-500/5 hover:bg-teal-500/10 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-teal-500/20 mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <p className="text-teal-800 dark:text-teal-200 font-medium">Select PDF</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400/60 mt-1">Text-based or Scanned</p>
                </label>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between p-4 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 rounded-2xl"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-teal-500/20 rounded-lg shrink-0">
                    <FileText className="text-teal-700 dark:text-teal-300" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-gray-900 dark:text-white font-bold truncate text-sm">{file.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ready to scan</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setExtractedData(""); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-red-500 transition shrink-0">
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
                    : "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-200 border border-teal-200 dark:border-teal-500/30"
                }`}
              >
                {message.type === "error" ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Extract Button */}
          <button 
            onClick={handleExtractText} 
            disabled={loading || !file}
            className="w-full py-4 rounded-xl font-bold shadow-lg text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95 flex items-center justify-center gap-2 mt-auto"
          >
            {loading ? (
              <span className="animate-pulse">Analyzing Document...</span>
            ) : (
              <><ScanText size={20} /> Start Extraction</>
            )}
          </button>
        </motion.div>

        {/* RIGHT PANEL: Result Area */}
        <motion.div 
          className="flex-1 flex flex-col bg-white/50 dark:bg-black/40 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/10 shadow-inner overflow-hidden relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Editor Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
            <span className="text-xs font-mono text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Output Console
            </span>
            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                disabled={!extractedData}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20 transition disabled:opacity-50"
              >
                <Copy size={14} /> Copy
              </button>
              <button 
                onClick={downloadTxtFile}
                disabled={!extractedData}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white transition disabled:opacity-50"
              >
                <Download size={14} /> Save .txt
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative">
            {extractedData ? (
              <textarea
                className="w-full h-full p-6 bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm resize-none outline-none custom-scrollbar leading-relaxed"
                value={extractedData}
                readOnly
                spellCheck="false"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400/50 dark:text-white/20 pointer-events-none">
                <Clipboard size={64} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">No extracted text yet</p>
                <p className="text-sm">Upload a document to see results here</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </ToolLayout>
  );
};

export default ExtractText;