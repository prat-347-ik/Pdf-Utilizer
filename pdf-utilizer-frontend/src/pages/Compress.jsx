import { useState } from "react";
import { compressPDF } from "../api/apiService";
import ToolLayout from "../components/ToolLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileArchive, UploadCloud, FileText, CheckCircle, 
  AlertCircle, Download, ArrowRight, X, Gauge 
} from "lucide-react";

const CompressPDF = () => {
  const [file, setFile] = useState(null);
  const [compressedFile, setCompressedFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState("medium"); // Default
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // --- NEW: Drag & Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault(); // Prevents browser from opening the file
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault(); // Prevents browser from opening the file
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setMessage(null);
        setCompressedFile(null);
      } else {
        setMessage({ type: "error", text: "Please upload a valid PDF file." });
      }
    }
  };
  // ---------------------------------

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      setCompressedFile(null);
    }
  };

  const handleCompress = async () => {
    if (!file) {
      setMessage({ type: "error", text: "Please select a PDF first." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("compression_level", compressionLevel);

    try {
      const response = await compressPDF(formData);
      const blob = new Blob([response.data], { type: "application/pdf" });
      setCompressedFile(URL.createObjectURL(blob));
      setMessage({ type: "success", text: "Compression successful!" });
    } catch (error) {
      console.error("Compression error:", error);
      setMessage({ type: "error", text: "Failed to compress PDF. Please try again." });
    }

    setLoading(false);
  };

  // Configuration for compression options
  const compressionOptions = [
    { id: "high", label: "Low Compression", sub: "Best Quality", desc: "Retains high image quality. Larger file size." },
    { id: "medium", label: "Medium Compression", sub: "Balanced", desc: "Good balance between quality and file size." },
    { id: "low", label: "High Compression", sub: "Smallest Size", desc: "Lower quality images. Best for email/web." },
  ];

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce the file size of your PDF documents while maintaining the best possible quality."
      theme="orange"
    >
      <div className="h-full flex flex-col max-w-3xl mx-auto">
        
        {/* 1. File Upload Section */}
        <div className="mb-8">
          {!file ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                id="compress-upload"
                className="hidden"
              />
              <label
                htmlFor="compress-upload"
                onDragOver={handleDragOver} // Added Event Listener
                onDrop={handleDrop}         // Added Event Listener
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-orange-500/50 rounded-2xl bg-orange-500/5 hover:bg-orange-500/10 transition-all cursor-pointer group"
              >
                <div className="p-4 rounded-full bg-orange-500/20 group-hover:scale-110 transition-transform mb-3">
                  <UploadCloud className="w-8 h-8 text-orange-400" />
                </div>
                <p className="text-lg font-medium text-orange-100">Click to upload PDF</p>
                <p className="text-sm text-orange-500/60 mt-1">or drag file here</p>
              </label>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-between p-4 bg-white/10 border border-orange-500/30 rounded-xl"
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
                onClick={() => { setFile(null); setCompressedFile(null); }}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X className="text-gray-400 hover:text-white" size={20} />
              </button>
            </motion.div>
          )}
        </div>

        {/* 2. Controls Section */}
        <AnimatePresence>
          {file && !compressedFile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Compression Level Selection Cards */}
              <div>
                <label className="flex items-center gap-2 text-orange-300 text-sm font-bold mb-4 ml-1">
                  <Gauge size={16} /> Select Compression Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {compressionOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setCompressionLevel(opt.id)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group
                        ${compressionLevel === opt.id 
                          ? "bg-orange-500/20 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        }`}
                    >
                      <h4 className={`font-bold text-sm mb-1 ${compressionLevel === opt.id ? "text-orange-300" : "text-gray-200"}`}>
                        {opt.label}
                      </h4>
                      <span className="text-xs font-semibold bg-black/30 px-2 py-0.5 rounded text-gray-300 mb-2 inline-block">
                        {opt.sub}
                      </span>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {opt.desc}
                      </p>
                      
                      {/* Selection Ring Indicator */}
                      {compressionLevel === opt.id && (
                        <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full shadow-lg" />
                      )}
                    </div>
                  ))}
                </div>
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

              {/* Compress Button */}
              <button
                onClick={handleCompress}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]
                  ${loading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white"
                  }`}
              >
                {loading ? "Compressing..." : (
                  <>Compress PDF <FileArchive size={18} /></>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Success / Download Section */}
        <AnimatePresence>
          {compressedFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-8 bg-green-500/10 border border-green-500/30 rounded-2xl text-center"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slight">
                <CheckCircle className="text-green-400 w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Compression Complete!</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Your file has been successfully compressed. It is now ready for download.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button
                  onClick={() => { setCompressedFile(null); setFile(null); }}
                  className="px-6 py-3 rounded-xl font-medium bg-white/5 text-gray-300 hover:bg-white/10 transition border border-white/5"
                >
                  Compress Another
                </button>
                <button
                  onClick={() => window.open(compressedFile, "_blank")}
                  className="px-8 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 transition transform hover:scale-105"
                >
                  <Download size={20} /> Download Result
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ToolLayout>
  );
};

export default CompressPDF;