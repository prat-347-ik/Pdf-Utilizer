import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, 
  FiCheck, 
  FiDownload, 
  FiUploadCloud, 
  FiX, 
  FiFileText,
  FiEyeOff
} from 'react-icons/fi';
import ToolLayout from '../components/ToolLayout';
import { redactPDF } from '../api/apiService';

const SmartRedact = () => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false); 
  
  // Configuration State
  const [config, setConfig] = useState({
    EMAIL_ADDRESS: true,
    PHONE_NUMBER: true,
    US_SSN: true,
    PERSON: false, 
  });

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setDownloadUrl(null);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault(); 
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); 
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setDownloadUrl(null);
      } else {
        alert("Please drop a valid PDF file.");
      }
    }
  };
  // -----------------------------------

  const handleProcess = async () => {
    if (!file) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('file', file);
    
    const activeTypes = Object.keys(config).filter(key => config[key]).join(',');
    formData.append('redactionTypes', activeTypes);

    try {
      const response = await redactPDF(formData);
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
    } catch (error) {
      console.error("Redaction failed", error);
      alert("Failed to redact document.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout 
      title="Smart Redact Shield" 
      description="Automatically detect and permanently black out sensitive PII (Personally Identifiable Information)."
      icon={<FiShield className="text-red-600 text-3xl" />}
      theme="red" 
    >
      <div className="max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-8">
        
        {/* LEFT PANEL */}
        <div className="md:w-5/12 flex flex-col gap-6">
          
          {/* 1. File Uploader Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 text-lg">
              <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Upload Document
            </h3>
            
            {!file ? (
              <>
                <input
                  type="file"
                  id="redact-upload"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="redact-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all cursor-pointer group
                    ${isDragging 
                      ? "border-red-500 bg-red-50 scale-105" 
                      : "border-red-200 bg-red-50 hover:bg-red-100"
                    }
                  `}
                >
                  <FiUploadCloud 
                    className={`w-10 h-10 transition-transform ${isDragging ? "text-red-600 scale-125" : "text-red-400 group-hover:scale-110"}`} 
                  />
                  <span className={`text-base mt-3 font-medium ${isDragging ? "text-red-600" : "text-red-400"}`}>
                    {isDragging ? "Drop it here!" : "Click or Drop PDF"}
                  </span>
                </label>
              </>
            ) : (
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3 bg-white rounded-lg text-red-500 shadow-sm">
                    <FiFileText size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-gray-700 truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size/1024/1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setDownloadUrl(null); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"><FiX size={20}/></button>
              </div>
            )}
          </div>

          {/* 2. Configuration Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex-1">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2 text-lg">
              <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              What to Hide?
            </h3>
            
            <div className="space-y-5">
              {Object.entries(config).map(([key, isActive]) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100" 
                  onClick={() => handleToggle(key)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                      <FiEyeOff size={20} />
                    </div>
                    <span className="text-base font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  
                  {/* ANIMATED TOGGLE SWITCH (Smaller Size) */}
                  <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isActive ? 'bg-red-500' : 'bg-gray-300'}`}>
                    <motion.div
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="bg-white w-4 h-4 rounded-full shadow-md"
                      animate={{ x: isActive ? 20 : 0 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleProcess}
              disabled={!file || isProcessing}
              className={`mt-10 w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3
                ${!file || isProcessing 
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiShield size={20} /> Redact Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:w-7/12 bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative min-h-[600px] flex flex-col">
          {downloadUrl ? (
            <>
              <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <FiCheck className="bg-green-100 rounded-full p-1 text-xl" />
                  Redaction Complete
                </div>
                <a 
                  href={downloadUrl} 
                  download={`redacted_${file.name}`}
                  className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-sm font-bold"
                >
                  <FiDownload /> Download Result
                </a>
              </div>
              <iframe src={downloadUrl} className="flex-1 w-full h-full" title="Redacted PDF" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 bg-gray-200/50 rounded-full flex items-center justify-center mb-6">
                <FiShield size={48} className="opacity-40" />
              </div>
              <p className="font-semibold text-lg">Upload a file to see the preview</p>
              <p className="text-sm opacity-60 max-w-sm text-center mt-3 leading-relaxed">
                Your document is processed locally in RAM for maximum security.
                <br/>No data is saved on our servers.
              </p>
            </div>
          )}
        </div>

      </div>
    </ToolLayout>
  );
};

export default SmartRedact;