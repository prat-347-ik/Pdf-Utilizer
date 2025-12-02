import { useState } from "react";
import { splitPDF } from "../api/apiService";
import ToolLayout from "../components/ToolLayout"; // 👈 Uses your new unified layout
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, UploadCloud, FileText, CheckCircle, 
  AlertCircle, Download, ArrowRight, X 
} from "lucide-react";

const SplitPDF = () => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState("");
  const [splitFile, setSplitFile] = useState(null);
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
        setSplitFile(null); // Reset previous result
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
      setSplitFile(null); // Reset previous result
    }
  };

  const handleSplit = async () => {
    if (!file || !pages.trim()) {
      setMessage({ type: "error", text: "Please select a PDF and specify pages." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    // Simple validation/parsing logic
    try {
      formData.append(
        "pages",
        JSON.stringify(pages.split(",").map((num) => parseInt(num.trim())))
      );

      const response = await splitPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setSplitFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "PDF split successfully!" });
    } catch (error) {
      console.error("Splitting error:", error);
      setMessage({ type: "error", text: "Invalid page numbers or server error." });
    }
    
    setLoading(false);
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific pages from your document. Enter exact page numbers to create a new, leaner PDF."
      theme="blue" // 👈 Sets the "Technical/Blue" theme
    >
      <div className="h-full flex flex-col max-w-2xl mx-auto">
        
        {/* 1. File Upload Section */}
        <div className="mb-8">
          {!file ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                id="split-upload"
                className="hidden"
              />
              <label
                htmlFor="split-upload"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-cyan-500/50 rounded-2xl bg-cyan-500/5 hover:bg-cyan-500/10 transition-all cursor-pointer group"
              >
                <div className="p-4 rounded-full bg-cyan-500/20 group-hover:scale-110 transition-transform mb-3">
                  <Scissors className="w-8 h-8 text-cyan-400" />
                </div>
                <p className="text-lg font-medium text-cyan-100">Click to Select PDF</p>
                <p className="text-sm text-cyan-500/60 mt-1">or drag file here</p>
              </label>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-between p-4 bg-white/10 border border-cyan-500/30 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <FileText className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-medium truncate max-w-[200px]">{file.name}</h3>
                  <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => { setFile(null); setSplitFile(null); }}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X className="text-gray-400 hover:text-white" size={20} />
              </button>
            </motion.div>
          )}
        </div>

        {/* 2. Controls Section (Only shows when file is selected) */}
        <AnimatePresence>
          {file && !splitFile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-cyan-300 text-sm font-bold mb-2 ml-1">
                  Which pages do you want to keep?
                </label>
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="e.g. 1, 3, 5"
                  className="w-full p-4 rounded-xl bg-black/20 border border-cyan-500/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-lg tracking-wide"
                />
                <p className="text-xs text-gray-500 mt-2 ml-1">
                  Separate page numbers with commas (e.g. 1, 2, 5).
                </p>
              </div>

              {/* Status Message */}
              {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  message.type === "error" ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"
                }`}>
                  {message.type === "error" ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
                  {message.text}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSplit}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]
                  ${loading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                  }`}
              >
                {loading ? "Processing..." : (
                  <>Split Document <Scissors size={18} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Success / Download State */}
        <AnimatePresence>
          {splitFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Download!</h3>
              <p className="text-gray-400 mb-6">Your selected pages have been extracted successfully.</p>
              
              <div className="flex gap-4 justify-center">
                 <button
                  onClick={() => { setSplitFile(null); setFile(null); setPages(""); }}
                  className="px-6 py-3 rounded-xl font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition"
                >
                  Split Another
                </button>
                <button
                  onClick={() => window.open(splitFile, "_blank")}
                  className="px-8 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 flex items-center gap-2 transition transform hover:scale-105"
                >
                  <Download size={18} /> Download PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ToolLayout>
  );
};

export default SplitPDF;