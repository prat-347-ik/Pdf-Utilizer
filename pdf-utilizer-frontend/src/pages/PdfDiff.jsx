import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMinimize2, 
  FiDownload, 
  FiFileText, 
  FiArrowRight, 
  FiCheckCircle, 
  FiAlertCircle,
  FiUploadCloud,
  FiX
} from 'react-icons/fi';
import ToolLayout from '../components/ToolLayout';
import { comparePDFs } from '../api/apiService'; 

const PdfDiff = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  // --- NEW: Drag & Drop Logic ---
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e, setFile) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
        setResultUrl(null); // Reset result on new upload
      } else {
        setError("Please select a valid PDF file.");
      }
    }
  };
  // -----------------------------

  // Helper to handle file selection
  const handleFileChange = (e, setFile) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
      setResultUrl(null); // Reset result on new upload
    } else {
      setError("Please select a valid PDF file.");
    }
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    
    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    const formData = new FormData();
    formData.append('file1', file1);
    formData.append('file2', file2);

    try {
      const response = await comparePDFs(formData);
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      setResultUrl(url);
    } catch (err) {
      console.error("Diff failed", err);
      setError("Comparison failed. Please ensure both files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout 
      title="Visual PDF Diff" 
      description="Compare two PDF versions and highlight the differences (Red = Removed, Green = Added)."
      icon={<FiMinimize2 className="text-purple-600 text-3xl" />}
    >
      <div className="max-w-5xl mx-auto">
        
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative">
          
          {/* --- File 1: Original (Red Theme) --- */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700 ml-1 flex items-center gap-2">
              <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs border border-red-200">OLD</span>
              Original Version
            </span>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
              {!file1 ? (
                <>
                  <input
                    type="file"
                    id="file-1-upload"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setFile1)}
                  />
                  <label
                    htmlFor="file-1-upload"
                    // --- ADDED DRAG & DROP HANDLERS (File 1) ---
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, setFile1)}
                    // ------------------------------------------
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-red-300 rounded-xl bg-red-50 hover:bg-red-100 transition-all cursor-pointer group"
                  >
                    <div className="p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform">
                      <FiUploadCloud className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-red-400 group-hover:text-red-600">
                      Upload Original PDF
                    </p>
                  </label>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm">
                      <FiFileText size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{file1.name}</span>
                      <span className="text-xs text-gray-500">{(file1.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile1(null)}
                    className="p-1 hover:bg-red-200 rounded-full text-red-400 hover:text-red-600 transition"
                  >
                    <FiX size={18} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Arrow Icon (Desktop only) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md text-gray-400">
            <FiArrowRight size={24} />
          </div>

          {/* --- File 2: New (Green Theme) --- */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-700 ml-1 flex items-center gap-2">
               <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs border border-green-200">NEW</span>
               Modified Version
            </span>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
              {!file2 ? (
                <>
                  <input
                    type="file"
                    id="file-2-upload"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, setFile2)}
                  />
                  <label
                    htmlFor="file-2-upload"
                    // --- ADDED DRAG & DROP HANDLERS (File 2) ---
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, setFile2)}
                    // ------------------------------------------
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-300 rounded-xl bg-green-50 hover:bg-green-100 transition-all cursor-pointer group"
                  >
                    <div className="p-3 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform">
                      <FiUploadCloud className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="mt-2 text-sm font-medium text-green-400 group-hover:text-green-600">
                      Upload Modified PDF
                    </p>
                  </label>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-lg text-green-500 shadow-sm">
                      <FiFileText size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{file2.name}</span>
                      <span className="text-xs text-gray-500">{(file2.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFile2(null)}
                    className="p-1 hover:bg-green-200 rounded-full text-green-400 hover:text-green-600 transition"
                  >
                    <FiX size={18} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-10">
          <button
            onClick={handleCompare}
            disabled={!file1 || !file2 || isProcessing}
            className={`
              flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1
              ${!file1 || !file2 || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-purple-500/30'
              }
            `}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Differences...
              </>
            ) : (
              <>Compare Documents <FiCheckCircle /></>
            )}
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3"
            >
              <FiAlertCircle className="text-xl flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {resultUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
            >
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Comparison Result</h3>
                <a 
                  href={resultUrl} 
                  download="comparison_result.pdf"
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <FiDownload /> Download PDF
                </a>
              </div>
              
              {/* PDF Preview Iframe */}
              <div className="w-full h-[600px] bg-gray-100">
                <iframe 
                  src={resultUrl} 
                  className="w-full h-full"
                  title="PDF Diff Preview"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ToolLayout>
  );
};

export default PdfDiff;